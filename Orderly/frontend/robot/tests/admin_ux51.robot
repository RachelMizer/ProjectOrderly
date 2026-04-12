*** Settings ***
Documentation     UX5.1 Admin navigation shell and layout
Library           SeleniumLibrary
Variables  ../variables/variables.py
Suite Setup       Open Browser To Admin Login
Suite Teardown    Close Browser

*** Test Cases ***
Business Admin Can Access Admin Dashboard Shell
    [Documentation]    Verifies the admin shell loads for a business user and shows the core UX5.1 navigation/layout.
    Login As Business Admin
    Wait For Dashboard Home
    Page Should Contain Link    Reports
    Page Should Contain Link    Inventory
    Page Should Contain Link    Product Catalog
    Page Should Contain Link    Orders
    Page Should Contain Link    ⚙ Account Settings
    Page Should Contain    Logout
    Page Should Contain    Pick Up Where You Left Off
    Page Should Contain    Inbox (0)
    Page Should Contain    USER |
    Capture Page Screenshot    ux51_dashboard_shell.png

Reports Route Keeps Admin Shell And Shows Inactive Deferred Links
    Login As Business Admin
    Open Admin Route And Wait    /admin/reports    Recent Reports
    Page Should Contain    No recent files.
    Page Should Contain    » Open Report
    Page Should Contain    » Generate Report
    Page Should Contain Link    « Go Back
    Page Should Contain Link    Inventory
    Page Should Contain Link    Product Catalog
    Page Should Contain Link    Orders
    Capture Page Screenshot    ux51_reports.png

Inventory Route Keeps Admin Shell And Shows Inactive Deferred Links
    Login As Business Admin
    Open Admin Route And Wait    /admin/inventory    Recent Inventory Reports
    Page Should Contain    » Open Inventory Report
    Page Should Contain Link    « Go Back
    Page Should Contain Link    Reports
    Page Should Contain Link    Product Catalog
    Page Should Contain Link    Orders
    Capture Page Screenshot    ux51_inventory.png

Catalog Route Keeps Admin Shell And Shows Inactive Deferred Links
    Login As Business Admin
    Open Admin Route And Wait    /admin/catalog    Recent Catalogs
    Page Should Contain    » Open Catalog
    Page Should Contain    » Product Lookup
    Page Should Contain Link    « Go Back
    Page Should Contain Link    Reports
    Page Should Contain Link    Inventory
    Page Should Contain Link    Orders
    Capture Page Screenshot    ux51_catalog.png

Orders Route Keeps Admin Shell And Shows Inactive Deferred Links
    Login As Business Admin
    Open Admin Route And Wait    /admin/orders    Recent Orders
    Page Should Contain    » Open Order
    Page Should Contain    » Search History
    Page Should Contain    » Returns & Refunds
    Page Should Contain    » Shipping
    Page Should Contain Link    « Go Back
    Page Should Contain Link    Reports
    Page Should Contain Link    Inventory
    Page Should Contain Link    Product Catalog
    Capture Page Screenshot    ux51_orders.png

Dashboard Nav Cards Route To All Admin Sections
    Login As Business Admin
    Wait For Dashboard Home

    Click Link    Reports
    Wait Until Location Contains    /admin/reports    10s
    Wait Until Page Contains    Recent Reports    10s

    Go To    ${BASE_URL}/admin
    Wait For Dashboard Home
    Click Link    Inventory
    Wait Until Location Contains    /admin/inventory    10s
    Wait Until Page Contains    Recent Inventory Reports    10s

    Go To    ${BASE_URL}/admin
    Wait For Dashboard Home
    Click Link    Product Catalog
    Wait Until Location Contains    /admin/catalog    10s
    Wait Until Page Contains    Recent Catalogs    10s

    Go To    ${BASE_URL}/admin
    Wait For Dashboard Home
    Click Link    Orders
    Wait Until Location Contains    /admin/orders    10s
    Wait Until Page Contains    Recent Orders    10s

Account Settings Opens From Admin Shell
    Login As Business Admin
    Wait For Dashboard Home
    Click Link    ⚙ Account Settings
    Wait Until Location Contains    /admin/account    10s
    Wait Until Page Contains    Account Settings    10s
    Page Should Contain    Account Information
    Page Should Contain    Account Role and Permissions
    Page Should Contain    Role:
    Capture Page Screenshot    ux51_account_settings.png

Logged Out User Is Redirected To Admin Login
    Clear Admin Session
    Go To    ${BASE_URL}/admin
    Wait Until Location Contains    /admin/login    10s
    Wait Until Page Contains Element    id=email    10s
    Page Should Contain Element    id=password
    Page Should Contain Button    Sign In
    Capture Page Screenshot    ux51_logged_out_redirect.png

Customer User Cannot Access Admin Shell
    Clear Admin Session
    Login As Customer User
    Go To    ${BASE_URL}/admin
    Wait Until Location Contains    /admin/login    10s
    Wait Until Page Contains Element    id=email    10s
    Page Should Contain Button    Sign In
    Page Should Not Contain    Dashboard Home
    Page Should Not Contain    Product Catalog
    Capture Page Screenshot    ux51_customer_denied.png

Logout From Admin Returns User To Admin Login
    Login As Business Admin
    Wait For Dashboard Home
    Click Element    xpath=//a[normalize-space()='Logout']
    Wait Until Location Contains    /admin/login    10s
    Wait Until Page Contains Element    id=email    10s
    Page Should Contain Button    Sign In
    Capture Page Screenshot    ux51_logout.png

*** Keywords ***
Open Browser To Admin Login
    Open Browser    ${BASE_URL}/admin/login    ${BROWSER}
    Maximize Browser Window
    Set Selenium Timeout    10s
    Set Selenium Speed    0.2s

Clear Admin Session
    Go To    ${BASE_URL}/admin/login
    Execute JavaScript    window.localStorage.clear();
    Execute JavaScript    window.sessionStorage.clear();
    Delete All Cookies
    Go To    ${BASE_URL}/admin/login
    Wait Until Page Contains Element    id=email    10s

Login As Business Admin
    Clear Admin Session
    Input Text    id=email    ${BUSINESS_EMAIL}
    Input Password    id=password    ${BUSINESS_PASSWORD}
    Click Button    Sign In
    Wait Until Keyword Succeeds    10x    1s    Location Should Contain    /admin
    Wait Until Page Contains    Welcome,    10s

Login As Customer User
    Clear Admin Session
    Input Text    id=email    ${CUSTOMER_EMAIL}
    Input Password    id=password    ${CUSTOMER_PASSWORD}
    Click Button    Sign In
    Wait Until Location Contains    /admin/login    10s

Wait For Dashboard Home
    Wait Until Keyword Succeeds    10x    1s    Location Should Contain    /admin
    Wait Until Page Contains    Dashboard Home    15s
    Wait Until Page Contains    Pick Up Where You Left Off    15s

Open Admin Route And Wait
    [Arguments]    ${path}    ${expected_text}
    Go To    ${BASE_URL}${path}
    Wait Until Location Contains    ${path}    10s
    Wait Until Page Contains    ${expected_text}    15s
    Wait Until Page Contains    USER |    15s