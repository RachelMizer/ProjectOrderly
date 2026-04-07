*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Test Cases ***
Admin Products Page Requires Login
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains Element    id=email    10s
    Page Should Contain Element    id=password
    Location Should Contain    /login

Customer Cannot Access Admin Products
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Filter the Menu    10s
    Location Should Be    ${BASE_URL}/
    Page Should Not Contain    Admin Products

Business User Can Access Admin Products
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Location Should Be    ${BASE_URL}/admin/products


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