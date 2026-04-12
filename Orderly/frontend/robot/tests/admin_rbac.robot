*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Variables ***
${CUSTOMER_EMAIL}       Customer1@example.com
${CUSTOMER_PASSWORD}    Password123!

*** Test Cases ***
Logged Out User Is Redirected To Admin Login From Admin Route
    Go To    ${BASE_URL}/admin/catalog
    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains Element    id=email    10s
    Page Should Contain Element    id=password
    Page Should Contain    Sign In

Customer Does Not See Admin Navigation On Storefront
    Login As Customer User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/
    Wait Until Page Contains    Filter the Menu    10s
    Page Should Not Contain Link    Product Catalog
    Page Should Not Contain Link    Reports
    Page Should Not Contain Link    Inventory
    Page Should Not Contain Link    Orders

Customer Is Redirected To Admin Login From Admin Route
    Login As Customer User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/admin/catalog
    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains Element    id=email    10s
    Page Should Contain Element    id=password
    Page Should Contain    Sign In
    Page Should Not Contain    Product Catalog

Business User Sees Admin Navigation On Dashboard
    Login As Business User
    Go To    ${BASE_URL}/admin
    Wait Until Page Contains    Dashboard Home    10s
    Wait Until Page Contains    Reports    10s
    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains    Orders    10s

Business User Can Open Admin Product Catalog Page
    Login As Business User
    Go To    ${BASE_URL}/admin/catalog
    Wait Until Page Contains Element    xpath=//input[@placeholder='Search products...']    10s
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.), 'CREATE NEW PRODUCT')]    10s
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.), 'ADD SUPPLIER')]    10s
    Location Should Be    ${BASE_URL}/admin/catalog

Business User Can Open Add Supplier Page
    Login As Business User
    Go To    ${BASE_URL}/admin/suppliers/new
    Wait Until Page Contains    Add New Supplier    10s
    Wait Until Page Contains Element    xpath=//input[@placeholder='Supplier name']    10s
    Location Should Be    ${BASE_URL}/admin/suppliers/new

Business User Can Open Admin Inventory Page
    Login As Business User
    Go To    ${BASE_URL}/admin/inventory
    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Recent Inventory Reports    10s
    Location Should Be    ${BASE_URL}/admin/inventory
    
*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END
