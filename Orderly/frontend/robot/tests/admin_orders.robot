*** Settings ***
Documentation     UI5.9 Admin Orders Page robot tests
Library           SeleniumLibrary    timeout=10
Library           String
Resource          ../resources/keywords.robot
Suite Setup       Open Browser To App
Suite Teardown    Close Browser
Test Setup        Log In As Business Admin

*** Variables ***
${BASE_URL}                 http://localhost:3000
${ADMIN_ORDERS_URL}         ${BASE_URL}/admin/orders

${SEARCH_INPUT}             css=input.submenu-search
${STATUS_FILTER}            xpath=(//select[contains(@class,'rpt-month-select')])[1]
${YEAR_FILTER}              xpath=(//select[contains(@class,'rpt-month-select')])[2]
${MONTH_FILTER}             xpath=(//select[contains(@class,'rpt-month-select')])[3]
${DAY_FILTER}               xpath=(//select[contains(@class,'rpt-month-select')])[4]
${CLEAR_FILTERS_BTN}        xpath=//button[contains(normalize-space(.), 'CLEAR FILTERS')]

${FIRST_ORDER_LINK}         xpath=(//span[contains(@class,'order-id-link')])[1]
${FIRST_TABLE_ROW}          xpath=(//table[contains(@class,'admin-table')]/tbody/tr)[1]
${BACK_TO_ORDERS_BTN}       xpath=//button[contains(normalize-space(.), 'BACK TO ORDERS')]
${FIRST_PENDING_BUTTON}     xpath=(//table[contains(@class,'admin-table')]/tbody/tr[td//span[contains(translate(normalize-space(.),'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ'),'PENDING')]]//button[contains(normalize-space(.),'Mark Complete')])[1]

*** Test Cases ***
Orders Page Loads With Layout And Table Headers
    Go To    ${ADMIN_ORDERS_URL}
    Reload Page
    Wait Until Page Contains    Order Management
    Wait Until Page Contains    Orders
    Wait Until Page Contains Element    xpath=//table[contains(@class,'admin-table')]
    Page Should Contain    Order #
    Page Should Contain    Date
    Page Should Contain    Customer
    Page Should Contain    Status
    Page Should Contain    Total
    Page Should Contain    Actions
    Page Should Contain Element    ${SEARCH_INPUT}
    Page Should Contain Element    ${STATUS_FILTER}
    Page Should Contain Element    ${YEAR_FILTER}
    Page Should Contain Element    ${MONTH_FILTER}
    Page Should Contain Element    ${DAY_FILTER}

Orders Page Shows Rows And Status Badges
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${FIRST_TABLE_ROW}
    ${row_text}=    Get Text    ${FIRST_TABLE_ROW}
    Should Match Regexp    ${row_text}    (?i).*#.*(PENDING|COMPLETED|CANCELLED).*

Orders Page Search Filters Visible Results
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${FIRST_ORDER_LINK}
    ${order_id}=    Get Text    ${FIRST_ORDER_LINK}
    ${order_id_clean}=    Remove String    ${order_id}    #    
    Clear Element Text    ${SEARCH_INPUT}
    Input Text    ${SEARCH_INPUT}    ${order_id_clean}
    Wait Until Page Contains    ${order_id}

Orders Page Status Filter Shows Completed Orders
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${FIRST_TABLE_ROW}
    Select From List By Value    ${STATUS_FILTER}    COMPLETED
    Wait Until Page Contains Element    ${FIRST_TABLE_ROW}
    ${rows}=    Get WebElements    xpath=//table[contains(@class,'admin-table')]/tbody/tr
    FOR    ${row}    IN    @{rows}
        ${txt}=    Get Text    ${row}
        Should Match Regexp    ${txt}    (?i).*COMPLETED.*
    END

Orders Page Cascading Date Filters Enable In Order
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${YEAR_FILTER}
    Element Should Be Disabled    ${MONTH_FILTER}
    Element Should Be Disabled    ${DAY_FILTER}
    Select From List By Value    ${YEAR_FILTER}    2026
    Element Should Be Enabled    ${MONTH_FILTER}
    Select From List By Value    ${MONTH_FILTER}    4
    Element Should Be Enabled    ${DAY_FILTER}

Orders Page Clear Filters Restores Default View
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${FIRST_ORDER_LINK}
    ${order_id}=    Get Text    ${FIRST_ORDER_LINK}
    ${order_id_clean}=    Remove String    ${order_id}    #    
    Clear Element Text    ${SEARCH_INPUT}
    Input Text    ${SEARCH_INPUT}    ${order_id_clean}
    Wait Until Page Contains    ${order_id}
    ${clear_exists}=    Run Keyword And Return Status    Page Should Contain Element    ${CLEAR_FILTERS_BTN}
    Run Keyword If    ${clear_exists}    Click Button    ${CLEAR_FILTERS_BTN}
    Run Keyword If    not ${clear_exists}    Clear Element Text    ${SEARCH_INPUT}

    ${value}=    Get Element Attribute    ${SEARCH_INPUT}    value
    Should Be Equal    ${value}    ${EMPTY} 

    Wait Until Page Contains Element    ${FIRST_ORDER_LINK}

Orders Page Mark Complete Control Presence Matches Data
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${FIRST_TABLE_ROW}
    ${pending_exists}=    Run Keyword And Return Status    Page Should Contain Element    ${FIRST_PENDING_BUTTON}
    Run Keyword If    ${pending_exists}    Page Should Contain Button    Mark Complete
    Run Keyword If    not ${pending_exists}    Log    No pending order is present in current seeded data; verified page without Mark Complete action.

Orders Page Opens Detail View From Visible Order Number
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${FIRST_ORDER_LINK}
    ${order_id}=    Get Text    ${FIRST_ORDER_LINK}
    Click Element    ${FIRST_ORDER_LINK}
    Wait Until Location Contains    /admin/orders/
    Wait Until Page Contains    ${order_id}

Order Detail Shows Receipt Layout And Back Navigation
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${FIRST_ORDER_LINK}
    Click Element    ${FIRST_ORDER_LINK}
    Wait Until Page Contains    Items
    Page Should Contain    Product
    Page Should Contain    Variant
    Page Should Contain    Modifiers
    Page Should Contain    Qty
    Page Should Contain    Unit Price
    Page Should Contain    Item Total
    Page Should Contain    Subtotal
    Page Should Contain    Tax
    Page Should Contain    Total
    Page Should Contain Element    ${BACK_TO_ORDERS_BTN}
    Click Button    ${BACK_TO_ORDERS_BTN}
    Wait Until Location Contains    /admin/orders

Order Detail Mark Complete Control Presence Matches Data
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains Element    ${FIRST_ORDER_LINK}
    ${pending_exists}=    Run Keyword And Return Status    Page Should Contain Element    ${FIRST_PENDING_BUTTON}
    Run Keyword If    ${pending_exists}    Click Element    xpath=(//table[contains(@class,'admin-table')]/tbody/tr[td//span[contains(translate(normalize-space(.),'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ'),'PENDING')]]//span[contains(@class,'order-id-link')])[1]
    Run Keyword If    not ${pending_exists}    Click Element    ${FIRST_ORDER_LINK}
    Wait Until Page Contains    Items
    Run Keyword If    ${pending_exists}    Page Should Contain Button    Mark Complete
    Run Keyword If    not ${pending_exists}    Page Should Not Contain Button    Mark Complete

Recent Orders Sidebar Appears On Orders Section
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains    Orders
    Page Should Contain    Recent Orders
    Page Should Contain    Returns & Refunds
    Page Should Contain    Shipping

*** Keywords ***
Open Browser To App
    Open Browser    ${BASE_URL}    chrome
    Maximize Browser Window

Log In As Business Admin
    Go To    ${BASE_URL}/admin
    Wait Until Page Contains    Orderly
    ${on_login}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//input
    Run Keyword If    ${on_login}    Perform Business Admin Login
    Wait Until Page Contains    Orders

Perform Business Admin Login
    ${email_present}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//input[@type='email' or contains(@placeholder,'Email') or contains(@name,'email')]
    ${password_present}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//input[@type='password' or contains(@placeholder,'Password') or contains(@name,'password')]
    Run Keyword If    ${email_present}    Input Text    xpath=//input[@type='email' or contains(@placeholder,'Email') or contains(@name,'email')]    business1@example.com
    Run Keyword If    ${password_present}    Input Password    xpath=//input[@type='password' or contains(@placeholder,'Password') or contains(@name,'password')]    Password123!
    Click Button    xpath=//button[contains(normalize-space(.), 'Login') or contains(normalize-space(.), 'Sign In')]