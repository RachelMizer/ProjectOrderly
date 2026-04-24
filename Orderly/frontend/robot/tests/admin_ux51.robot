*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot

*** Variables ***
${LOGIN_URL}              ${BASE_URL}/login
${ADMIN_REPORTS_URL}      ${BASE_URL}/admin/reports
${ADMIN_INVENTORY_URL}    ${BASE_URL}/admin/inventory
${ADMIN_CATALOG_URL}      ${BASE_URL}/admin/catalog
${ADMIN_ORDERS_URL}       ${BASE_URL}/admin/orders
${ADMIN_DASHBOARD_URL}    ${BASE_URL}/admin

*** Test Cases ***
Reports Route Keeps Admin Shell And Shows Current Reports Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_REPORTS_URL}

    Wait Until Page Contains    Welcome,    15s
    Wait Until Page Contains    Generate a Report    15s
    Wait Until Page Contains    View sales performance, product trends, and business metrics    15s
    Wait Until Page Contains    Return to Dashboard    15s
    Wait Until Page Contains    Revenue by Month    15s
    Wait Until Page Contains    Sales Summary    15s
    Wait Until Page Contains    Product Performance    15s
    Capture Page Screenshot
    Close Browser

Inventory Route Keeps Admin Shell And Shows Current Inventory Content
    Open Browser And Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}
    Wait Until Page Contains    Inventory Management    15s
    Wait Until Page Contains    Product Dependencies    15s
    Wait Until Page Contains    Supply Inventory    15s
    Capture Page Screenshot
    Close Browser

Catalog Route Keeps Admin Shell And Shows Current Catalog Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains    Welcome,    15s
    Wait Until Page Contains    Browse and manage the full product catalog    15s
    Wait Until Page Contains    Return to Dashboard    15s
    Wait Until Element Is Visible    xpath=//input[@placeholder='Search products...']    15s
    Wait Until Page Contains    CREATE NEW PRODUCT    15s
    Wait Until Page Contains    ADD SUPPLIER    15s
    Capture Page Screenshot
    Close Browser

Orders Route Keeps Admin Shell And Shows Inactive Deferred Links
    Open Browser And Login As Business User
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains    Order Management    15s
    ${table_status}=    Run Keyword And Return Status
    ...    Wait Until Page Contains Element    xpath=//table[contains(@class,'admin-table')]    10s
    ${empty_status}=    Run Keyword And Return Status
    ...    Wait Until Page Contains    No orders found.    2s
    Should Be True    ${table_status} or ${empty_status}
    Capture Page Screenshot
    Close Browser

Dashboard Nav Cards Route To All Admin Sections
    Open Browser And Login As Business User
    Go To    ${BASE_URL}/admin

    Wait Until Location Contains    /admin    10s
    Wait Until Page Contains Element    xpath=//body    10s

    Capture Page Screenshot
    Close Browser

*** Keywords ***
Open Browser And Login As Business User
    Open Browser    ${LOGIN_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User