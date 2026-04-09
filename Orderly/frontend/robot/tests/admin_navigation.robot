*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Test Cases ***
Logged Out User Is Redirected To Login From Admin Home
    Go To    ${BASE_URL}/admin
    Wait Until Page Contains Element    name=email    10s
    Location Should Contain    /login

Customer Does Not See Admin Nav
    Login As Test User
    Sync Auth Token Key For Frontend
    Wait Until Page Contains Element    xpath=//a[@href='/']    10s
    Page Should Not Contain    Admin Dashboard
    Page Should Not Contain    Dashboard Home
    Page Should Not Contain    Suppliers
    Page Should Not Contain    Inventory

Customer Is Redirected Home From Admin Inventory
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/admin/inventory
    Wait Until Page Contains    Filter the Menu    10s
    Location Should Be    ${BASE_URL}/
    Page Should Not Contain    Admin Inventory

Business User Sees Persistent Admin Nav On Admin Home
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin
    Wait Until Page Contains Element    xpath=//h2[normalize-space()='Admin Dashboard']    10s
    Page Should Contain Element    xpath=//a[@href='/admin']
    Page Should Contain Element    xpath=//a[@href='/admin/products']
    Page Should Contain Element    xpath=//a[@href='/admin/suppliers']
    Page Should Contain Element    xpath=//a[@href='/admin/inventory']

Business User Can Route To Products
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Page Should Contain Element    xpath=//h2[normalize-space()='Admin Dashboard']
    Page Should Contain Element    xpath=//a[@href='/admin/products']

Business User Can Route To Suppliers
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/suppliers
    Wait Until Page Contains    Admin Suppliers    10s
    Page Should Contain Element    xpath=//h2[normalize-space()='Admin Dashboard']
    Page Should Contain Element    xpath=//a[@href='/admin/suppliers']

Business User Can Route To Inventory
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/inventory
    Wait Until Page Contains    Admin Inventory    10s
    Page Should Contain Element    xpath=//h2[normalize-space()='Admin Dashboard']
    Page Should Contain Element    xpath=//a[@href='/admin/inventory']

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