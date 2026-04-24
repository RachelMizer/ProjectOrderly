*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py

*** Keywords ***
Open Browser To App
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Timeout    10 seconds
    Set Selenium Speed    0.2 seconds

Close Browser Session
    Close Browser

Go To Login Page
    Go To    ${BASE_URL}/login
    Wait Until Page Contains Element    id=email

Login As User
    [Arguments]    ${email}    ${password}
    Go To    ${BASE_URL}/login
    Wait Until Page Contains Element    id=email    10s

    Input Text    id=email    ${email}
    Input Text    id=password    ${password}

    Click Button    xpath=//button[normalize-space()='Login']

    Wait Until Location Is    ${BASE_URL}/    10s


Login As Customer User
    Login As User    ${CUSTOMER_EMAIL}    ${CUSTOMER_PASSWORD}

Login As Business User
    Login As User    ${BUSINESS_EMAIL}    ${BUSINESS_PASSWORD}
Open Profile Page
    Click Link    Profile
    Wait Until Page Contains    My Profile

Fill Profile Form
    Input Text    id=firstName    ${UPDATED_FIRST_NAME}
    Input Text    id=lastName    ${UPDATED_LAST_NAME}
    Input Text    id=streetAddress    ${UPDATED_STREET}
    Input Text    id=city    ${UPDATED_CITY}
    Input Text    id=state    ${UPDATED_STATE}
    Input Text    id=zipcode    ${UPDATED_ZIP}
    Input Text    id=phone    ${UPDATED_PHONE}

Clear And Type
    [Arguments]    ${locator}    ${value}
    Click Element    ${locator}
    Press Keys    ${locator}    CTRL+a
    Press Keys    ${locator}    BACKSPACE
    Input Text    ${locator}    ${value}

Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END

Create Admin Product
    [Arguments]    ${product_name}    ${description}
    Wait For Product Form Options
    Input Text    name=name    ${product_name}
    Select Product Category
    Select Product Supplier
    Input Text    name=description    ${description}
    Click Button    xpath=//button[normalize-space()='Create Product']
    Wait Until Keyword Succeeds    10s    1s    Page Should Contain    ${product_name}