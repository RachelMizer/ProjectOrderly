*** Settings ***
Library    SeleniumLibrary
Library    Collections
Resource   ../resources/keywords.robot
Variables  ../variables/variables.py
Suite Setup       Open Test Browser
Suite Teardown    Close Browser
Test Setup        Go To Storefront


*** Variables ***
${ORDER_HISTORY_URL}          ${BASE_URL}/order-history
${ADMIN_ORDERS_URL}           ${BASE_URL}/admin/orders
${ORDER_HISTORY_TITLE}        xpath=//h2[normalize-space()='Your Order History']
${ACCOUNT_SUBMENU}            css=.account-submenu
${ORDER_HISTORY_TABLE}        css=table.order-hist-table
${ORDER_HISTORY_ROWS}         css=tr.order-hist-row
${ORDER_DETAIL_PAGE}          css=.order-detail-pg
${ORDER_DETAIL_TABLE}         css=table.order-detail-table

${ADMIN_ORDERS_TITLE}         css=h1.orders-view-title
${ADMIN_ORDERS_TABLE}         css=table.admin-table
${ADMIN_FEEDBACK}             css=.orders-feedback
${ADMIN_ORDER_LINK}           xpath=(//span[contains(@class,'order-id-link')])[1]

${ADMIN_DETAIL_HEADER}        css=.order-detail-header
${ADMIN_DETAIL_CUSTOMER}      css=.order-detail-customer
${ADMIN_DETAIL_ITEMS_HEADER}  xpath=//p[contains(@class,'inv-section-header') and normalize-space()='Items']

*** Test Cases ***
Customer Order History Shows Table And Account Submenu
    Login As Seeded Customer
    Go To    ${ORDER_HISTORY_URL}
    Wait Until Element Is Visible    ${ACCOUNT_SUBMENU}    15s
    Wait Until Element Is Visible    ${ORDER_HISTORY_TITLE}    15s
    Wait Until Element Is Visible    ${ORDER_HISTORY_TABLE}    15s
    Page Should Contain    Profile
    Page Should Contain    Order History
    Page Should Contain    Order #
    Page Should Contain    Date
    Page Should Contain    Status
    Page Should Contain    Total

Customer Can Open Order Detail By Clicking History Row
    Login As Seeded Customer
    Go To    ${ORDER_HISTORY_URL}
    Wait Until Element Is Visible    ${ORDER_HISTORY_ROWS}    15s
    ${row_count}=    Get Element Count    ${ORDER_HISTORY_ROWS}
    Should Be True    ${row_count} > 0
    Click Element    xpath=(//tr[contains(@class,'order-hist-row')])[1]
    Wait Until Element Is Visible    ${ORDER_DETAIL_PAGE}    15s
    Page Should Contain Element    ${ORDER_DETAIL_TABLE}
    Page Should Contain    Back to Order History

Admin Orders Page Loads
    Login As Seeded Business User
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Element Is Visible    ${ADMIN_ORDERS_TITLE}    20s
    Wait Until Element Is Visible    ${ADMIN_ORDERS_TABLE}    20s
    Page Should Contain    Orders
    Page Should Contain    Customer
    Page Should Contain    Status
    Page Should Contain    Total

Admin Can Mark Pending Order Complete And Sees Banner
    Login As Seeded Business User
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Element Is Visible    ${ADMIN_ORDERS_TITLE}    20s
    Wait Until Element Is Visible    ${ADMIN_ORDERS_TABLE}    20s
    ${complete_btns}=    Get Element Count    xpath=//button[contains(@class,'table-action-btn') and normalize-space()='Mark Complete']
    Run Keyword If    ${complete_btns} == 0    Fail    No pending admin orders are available. Create pending orders before running this suite.
    Click Button    xpath=(//button[contains(@class,'table-action-btn') and normalize-space()='Mark Complete'])[1]
    Wait Until Keyword Succeeds    5s    500ms    Element Should Be Visible    ${ADMIN_FEEDBACK}
    ${banner_text}=    Get Text    ${ADMIN_FEEDBACK}
    Should Contain    ${banner_text}    complete

Admin Can Open Order Detail And See Detail Layout
    Login As Seeded Business User
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Element Is Visible    ${ADMIN_ORDERS_TITLE}    20s
    Wait Until Element Is Visible    ${ADMIN_ORDERS_TABLE}    20s
    Click Element    ${ADMIN_ORDER_LINK}
    Wait Until Element Is Visible    xpath=//span[contains(@class,'submenu-label') and contains(normalize-space(),'Order #')]    20s
    Wait Until Element Is Visible    ${ADMIN_DETAIL_HEADER}    20s
    Wait Until Element Is Visible    ${ADMIN_DETAIL_ITEMS_HEADER}    20s
    Page Should Contain    Items

Admin Order Detail Shows Customer Field
    [Documentation]    Switch off Pending-only view when verifying orders that may now be completed.
    Login As Seeded Business User
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Element Is Visible    ${ADMIN_ORDERS_TITLE}    20s
    Wait Until Element Is Visible    ${ADMIN_ORDERS_TABLE}    20s
    Clear Admin Status Filter
    Click Element    ${ADMIN_ORDER_LINK}
    Wait Until Element Is Visible    ${ADMIN_DETAIL_HEADER}    20s
    ${customer_text}=    Get Text    ${ADMIN_DETAIL_CUSTOMER}
    Should Not Be Empty    ${customer_text}

Customer Pending Order Can Be Cancelled From Order History
    [Documentation]    Run after admin pending-order tests because it mutates order state.
    Login As Seeded Customer
    Go To    ${ORDER_HISTORY_URL}
    Wait Until Element Is Visible    ${ORDER_HISTORY_TABLE}    15s
    ${cancel_btns}=    Get Element Count    xpath=//tr[contains(@class,'order-hist-row')]//button[contains(@class,'cancel-order-btn')]
    Should Be True    ${cancel_btns} > 0
    Click Button    xpath=(//tr[contains(@class,'order-hist-row')]//button[contains(@class,'cancel-order-btn')])[1]
    Handle Alert    ACCEPT
    Wait Until Page Contains    CANCELLED    15s

Customer Pending Order Can Be Cancelled From Order Detail
    [Documentation]    Requires another pending order to still exist. Re-seed if this fails after prior runs.
    Login As Seeded Customer
    Go To    ${ORDER_HISTORY_URL}
    Wait Until Element Is Visible    ${ORDER_HISTORY_TABLE}    15s
    ${pending_rows}=    Get Element Count    xpath=//tr[contains(@class,'order-hist-row')][.//button[contains(@class,'cancel-order-btn')]]
    Should Be True    ${pending_rows} > 0
    Click Element    xpath=(//tr[contains(@class,'order-hist-row')][.//button[contains(@class,'cancel-order-btn')]])[1]
    Wait Until Element Is Visible    ${ORDER_DETAIL_PAGE}    15s
    Element Should Be Visible    xpath=//button[contains(@class,'cancel-order-btn') and normalize-space()='Cancel Order']
    Click Button    xpath=//button[contains(@class,'cancel-order-btn') and normalize-space()='Cancel Order']
    Handle Alert    ACCEPT
    Wait Until Page Contains    CANCELLED    15s
    Page Should Not Contain Element    xpath=//button[contains(@class,'cancel-order-btn') and normalize-space()='Cancel Order']

Customer Non Pending Detail Does Not Show Cancel Button
    Login As Seeded Customer
    Go To    ${ORDER_HISTORY_URL}
    Wait Until Element Is Visible    ${ORDER_HISTORY_TABLE}    15s
    Click Non Pending Or Non Cancellable Order Row
    Wait Until Element Is Visible    ${ORDER_DETAIL_PAGE}    15s
    Page Should Not Contain Element    xpath=//button[contains(@class,'cancel-order-btn') and normalize-space()='Cancel Order']

*** Keywords ***
Open Test Browser
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Timeout    15s
    Set Selenium Speed      0s

Go To Storefront
    Go To    ${BASE_URL}
    Wait Until Page Contains    Welcome    15s

Login As Seeded Customer
    Go To    ${BASE_URL}/login
    Wait Until Element Is Visible    xpath=//input[@type='email' or @name='email']    15s
    Input Text    xpath=//input[@type='email' or @name='email']    ${CUSTOMER_EMAIL}
    Input Password    xpath=//input[@type='password' or @name='password']    ${CUSTOMER_PASSWORD}
    Click Button    xpath=//button[normalize-space()='Login' or normalize-space()='Sign In']
    Wait Until Keyword Succeeds    15s    1s    Customer Login Should Be Complete

Login As Seeded Business User
    Go To    ${BASE_URL}/login
    Wait Until Element Is Visible    xpath=//input[@type='email' or @name='email']    15s
    Input Text    xpath=//input[@type='email' or @name='email']    ${BUSINESS_EMAIL}
    Input Password    xpath=//input[@type='password' or @name='password']    ${BUSINESS_PASSWORD}
    Click Button    xpath=//button[normalize-space()='Login' or normalize-space()='Sign In']
    Wait Until Keyword Succeeds    20s    1s    Business Login Should Be Complete

Customer Login Should Be Complete
    ${location}=    Get Location
    Should Not Contain    ${location}    /login

Business Login Should Be Complete
    ${location}=    Get Location
    Should Not Contain    ${location}    /login
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Keyword Succeeds    20s    1s    Admin Orders Should Be Reachable

Admin Orders Should Be Reachable
    ${location}=    Get Location
    Should Contain    ${location}    /admin/orders
    Wait Until Page Contains Element    ${ADMIN_ORDERS_TITLE}    10s

Clear Admin Status Filter
    [Documentation]    Orders page defaults to Pending. Clear it before checking orders that may be completed/cancelled.
    ${clear_buttons}=    Get Element Count    xpath=//button[normalize-space()='Clear Filters' or normalize-space()='Clear']
    Run Keyword If    ${clear_buttons} > 0    Click Button    xpath=(//button[normalize-space()='Clear Filters' or normalize-space()='Clear'])[1]

Click Non Pending Or Non Cancellable Order Row
    ${non_pending_count}=    Get Element Count    xpath=//tr[contains(@class,'order-hist-row')][not(.//button[contains(@class,'cancel-order-btn')])]
    Run Keyword If    ${non_pending_count} > 0    Click Element    xpath=(//tr[contains(@class,'order-hist-row')][not(.//button[contains(@class,'cancel-order-btn')])])[1]
    ...    ELSE    Fail    No non-pending / non-cancellable order row was available for this customer.

Should Not Be Empty
    [Arguments]    ${value}
    Should Not Be Equal As Strings    ${value}    ${EMPTY}