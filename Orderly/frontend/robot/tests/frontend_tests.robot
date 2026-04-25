*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Variables ***
${TEST_EMAIL}          jamie.ortega@gmail.com
${TEST_PASSWORD}       Password123!
${UPDATED_FIRST_NAME}  Ken
${UPDATED_CITY}        Charlotte

*** Test Cases ***
App Navigation Hides Profile Link When Not Authenticated
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    xpath=//a[@href='/']    10s
    Page Should Contain Link    Store
    Page Should Not Contain Element    xpath=//a[@href='/profile']
    Page Should Not Contain Element    xpath=//a[@href='/order-history']
    Page Should Contain Link    Login
    Page Should Contain Link    Register

App Navigation Shows Auth Links When Authenticated
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Page Should Contain Element    xpath=//a[@href='/profile']
    Page Should Contain Button    Logout

Login Page Renders Form
    Go To    ${BASE_URL}/login
    Wait Until Page Contains    Login    10s
    Page Should Contain Element    name=email
    Page Should Contain Element    name=password
    Page Should Contain Button    Login

Successful Login Submits Valid Credentials
    Go To    ${BASE_URL}/login
    Input Text        xpath=//input[@type='email' or contains(@name,'email') or contains(@id,'email')]    ${CUSTOMER_EMAIL}
    Input Password    xpath=//input[@type='password' or contains(@name,'password') or contains(@id,'password')]    ${CUSTOMER_PASSWORD}
    Click Button      xpath=//button[contains(normalize-space(.), 'Login') or contains(normalize-space(.), 'Sign In')]
    Wait Until Page Contains Element    xpath=//a[contains(@href,'/profile') and contains(., 'Your Account')]    10s

Register Page Renders Form
    Go To    ${BASE_URL}/register
    Wait Until Page Contains    Register    10s
    Page Should Contain Element    name=firstName
    Page Should Contain Element    name=lastName
    Page Should Contain Element    name=email
    Page Should Contain Element    name=password

Register Page Accepts Form Input
    Go To    ${BASE_URL}/register
    Wait Until Page Contains Element    name=firstName    10s
    Input Text    name=firstName    Test
    Input Text    name=lastName     User
    Input Text    name=email        temp-user@example.com
    Input Password    name=password    Password123!
    Textfield Value Should Be    name=firstName    Test
    Textfield Value Should Be    name=lastName     User
    Textfield Value Should Be    name=email        temp-user@example.com

Reset Password Request Page Renders Form
    Go To    ${BASE_URL}/password-reset
    Wait Until Page Contains    Forgot Password    10s
    Page Should Contain Element    id=email
    Page Should Contain Button    Send Reset Link

Reset Password Request Accepts Email Input
    Go To    ${BASE_URL}/password-reset
    Wait Until Page Contains Element    id=email    10s
    Input Text    id=email    ${TEST_EMAIL}
    Textfield Value Should Be    id=email    ${TEST_EMAIL}

Reset Password Page Renders Form
    Go To    ${BASE_URL}/reset-password?uid=abc123&token=xyz123
    Wait Until Page Contains Element    xpath=//input[@type='password']    10s
    Page Should Contain Button    Reset Password

Reset Password Page Accepts Password Input
    Go To    ${BASE_URL}/reset-password?uid=abc123&token=xyz123
    Wait Until Page Contains Element    xpath=//input[@type='password']    10s
    Input Password    xpath=//input[@type='password']    Password123!
    Textfield Value Should Be    xpath=//input[@type='password']    Password123!

Profile Page Loads Existing Data
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    id=firstName    10s
    Page Should Contain    Your Profile
    Page Should Contain Element    id=lastName
    Page Should Contain Element    id=streetAddress
    Page Should Contain Element    id=city
    Page Should Contain Element    id=state
    Page Should Contain Element    id=zipcode
    Page Should Contain Element    id=email
    Page Should Contain Element    id=phone

Profile Email Field Is Disabled
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    id=email    10s
    Element Should Be Disabled    id=email

Profile Allows Editing Editable Fields
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    id=firstName    10s
    Clear Element Text    id=firstName
    Input Text    id=firstName    ${UPDATED_FIRST_NAME}
    Clear Element Text    id=city
    Input Text    id=city    ${UPDATED_CITY}
    Textfield Value Should Be    id=firstName    ${UPDATED_FIRST_NAME}
    Textfield Value Should Be    id=city    ${UPDATED_CITY}
    Element Should Be Disabled    id=email

Profile Save Submits Updated Data
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    id=firstName    10s
    Clear Element Text    id=firstName
    Input Text    id=firstName    ${UPDATED_FIRST_NAME}
    Click Button    xpath=//button[normalize-space()='Save']
    Wait Until Page Contains    Profile updated successfully    10s

StoreFront Renders Product Grid
    Go To    ${BASE_URL}
    Wait Until Page Contains    Filters    10s
    Wait Until Page Contains Element    css=.product-grid    10s
    Wait Until Page Contains Element    css=.product-card    10s

StoreFront Shows Product Name
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css=.product-card h3    10s

StoreFront Shows Price
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css=.product-card .price    10s
    ${price}=    Get Text    css=.product-card .price
    Should Contain    ${price}    $

StoreFront Shows Add To Cart Or Out Of Stock State
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css=.product-card    10s
    ${add_count}=    Get Element Count    css=.product-card .add-to-cart-btn
    ${oos_count}=    Get Element Count    css=.product-card .OOS
    Should Be True    ${add_count} > 0 or ${oos_count} > 0

StoreFront Shows View And Customize Link
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css=.product-card .view-link    10s
    ${link_text}=    Get Text    css=.product-card .view-link
    Should Be Equal    ${link_text}    View & Customize

StoreFront Category Filter Can Be Toggled
    Go To    ${BASE_URL}
    Wait Until Page Contains    Filters    10s
    Wait Until Page Contains Element    css=.filter input[type="checkbox"]    10s
    Click Element    css=.filter input[type="checkbox"]

View And Customize Navigates To Product Page
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    css=.product-card .view-link    10s
    Click Element    css=.product-card .view-link
    Wait Until Location Contains    /product/    10s

Order History Page Loads For Authenticated User
    Login As Customer User
    Sync Auth Token Key For Frontend
    Open Order History From Account
    Wait Until Page Contains    Your Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s

Order History Shows Empty State Or Orders
    Login As Customer User
    Sync Auth Token Key For Frontend
    Open Order History From Account
    Wait Until Page Contains    Your Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s
    ${order_count}=    Get Element Count    xpath=//table[contains(@class,'order-hist-table')]//tr[contains(@class,'order-hist-row')]
    ${empty_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'No past orders found')]
    Should Be True    ${order_count} > 0 or ${empty_count} > 0

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END

Open Order History From Account
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']