*** Settings ***
Resource   ../resources/keywords.robot
Test Setup     Open Browser To App
Test Teardown  Close Browser Session

*** Test Cases ***
Logged Out User Should Not See Profile Link
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    xpath=//a[@href='/']    10s
    Page Should Contain Link    Home
    Page Should Not Contain Link    Profile
    Page Should Contain Link    Login
    Page Should Contain Link    Register

Logged In User Can View Profile Page
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    id=firstName    10s
    Page Should Contain    Profile
    Page Should Contain Element    id=firstName
    Page Should Contain Element    id=lastName
    Page Should Contain Element    id=streetAddress
    Page Should Contain Element    id=city
    Page Should Contain Element    id=state
    Page Should Contain Element    id=zipcode
    Page Should Contain Element    id=email
    Page Should Contain Element    id=phone

Email Field Should Be Disabled On Profile Page
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    id=email    10s
    Element Should Be Disabled    id=email

Logged In User Can Update Profile
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    id=firstName    10s

    Clear Element Text    id=firstName
    Input Text    id=firstName    ${UPDATED_FIRST_NAME}
    Clear Element Text    id=lastName
    Input Text    id=lastName    ${UPDATED_LAST_NAME}
    Clear Element Text    id=streetAddress
    Input Text    id=streetAddress    ${UPDATED_STREET}
    Clear Element Text    id=city
    Input Text    id=city    ${UPDATED_CITY}
    Clear Element Text    id=state
    Input Text    id=state    ${UPDATED_STATE}
    Clear Element Text    id=zipcode
    Input Text    id=zipcode    ${UPDATED_ZIP}
    Clear Element Text    id=phone
    Input Text    id=phone    ${UPDATED_PHONE}

    Click Button    xpath=//button[normalize-space()='Save']
    Wait Until Page Contains    Profile updated successfully    10s

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=   Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END