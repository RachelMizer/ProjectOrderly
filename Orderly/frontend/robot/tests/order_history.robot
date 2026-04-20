*** Settings ***
Resource   ../resources/keywords.robot
Test Setup     Open Browser To App
Test Teardown  Close Browser Session

*** Test Cases ***
Logged In User Can View Order History Page
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']
    Wait Until Page Contains    Your Order History    10s


Order History Shows Pagination Controls
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']
    Wait Until Page Contains    Your Order History    10s
    Page Should Contain Button    Previous
    Page Should Contain Button    Next

Order History Can Open Order Detail When Past Orders Exist
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Click Element    xpath=//a[@href='/profile']
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']
    Wait Until Page Contains    Your Order History    10s
    Wait Until Page Contains Element    xpath=//table[contains(@class,'order-hist-table')]    10s
    Click Element    xpath=(//table[contains(@class,'order-hist-table')]//tr[contains(@class,'order-hist-row')]//td[1])[1]
    Wait Until Page Contains    Order #    10s

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=   Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END

Login As Empty History Customer
    Go To    ${BASE_URL}/login
    Input Text    name=email    ${EMPTY_HISTORY_USER_EMAIL}
    Input Password    name=password    ${EMPTY_HISTORY_USER_PASSWORD}
    Click Button    xpath=//button[normalize-space()='Login']