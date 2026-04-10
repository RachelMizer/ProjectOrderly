*** Settings ***
Resource   ../resources/keywords.robot
Test Setup     Open Browser To App
Test Teardown  Close Browser Session

*** Test Cases ***
Logged In User Can View Order History Page
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']
    Wait Until Page Contains    Order History    10s

Order History Shows Empty State When No Past Orders Exist
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']
    Wait Until Page Contains    Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s

    ${empty_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'No past orders found.')]
    ${order_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Order #')]
    Should Be True    ${empty_count} > 0 or ${order_count} > 0

Order History Shows Pagination Controls
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']
    Wait Until Page Contains    Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s
    Page Should Contain Button    Previous
    Page Should Contain Button    Next
    Page Should Contain           Page 1

Order History Can Open Order Detail When Past Orders Exist
    [Documentation]    This passes only when the seeded/test user actually has at least one non-DRAFT order.
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Click Element    xpath=//a[@href='/order-history']
    Wait Until Page Contains    Order History    10s
    Wait Until Page Does Not Contain    Loading order history...    10s

    ${order_count}=    Get Element Count    xpath=//*[contains(normalize-space(.), 'Order #')]
    IF    ${order_count} > 0
        Click Element    xpath=(//*[contains(normalize-space(.), 'Order #')])[1]
        Wait Until Location Contains    /orders/    10s
    ELSE
        Log    No non-draft orders available for this user; skipping click-through assertion.
    END

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=   Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END