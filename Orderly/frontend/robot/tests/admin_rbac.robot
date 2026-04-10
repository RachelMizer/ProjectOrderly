*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Variables ***
${CUSTOMER_EMAIL}       Customer1@example.com
${CUSTOMER_PASSWORD}    Password123!

*** Test Cases ***
Logged Out User Is Redirected To Login From Admin Route
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains Element    name=email    10s
    Page Should Contain Element    name=password
    Location Should Contain    /login

Customer Does Not See Admin Dashboard Link
    Login As Customer User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/']    10s
    Page Should Not Contain Link    Admin Dashboard

Customer Is Redirected Home From Admin Route
    Login As Customer User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Filter the Menu    10s
    Location Should Be    ${BASE_URL}/
    Page Should Not Contain    Admin Products

Business User Sees Admin Dashboard Link
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}
    Wait Until Page Contains    Admin Dashboard    10s

Business User Can Open Admin Products Page
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Dashboard    10s
    Wait Until Page Contains    Products    10s
    Location Should Be    ${BASE_URL}/admin/products

Business User Can Open Admin Suppliers Page
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/suppliers
    Wait Until Page Contains    Admin Suppliers    10s
    Location Should Be    ${BASE_URL}/admin/suppliers

Business User Can Open Admin Inventory Page
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/inventory
    Wait Until Page Contains    Admin Inventory    10s
    Location Should Be    ${BASE_URL}/admin/inventory

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END

Seed Frontend Session As Business User
    Go To    ${BASE_URL}
    Execute JavaScript
    ...    window.localStorage.setItem('accessToken', 'fake-business-token');
    ...    window.localStorage.setItem('user', JSON.stringify({
    ...      firstName: 'Biz',
    ...      role: 'BUSINESS'
    ...    }));
    Reload Page