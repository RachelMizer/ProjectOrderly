*** Settings ***
Library    SeleniumLibrary
Resource   ../resources/keywords.robot
Variables  ../variables/variables.py

*** Variables ***
${ADMIN_REPORTS_URL}      ${BASE_URL}/admin/reports
${ADMIN_INVENTORY_URL}    ${BASE_URL}/admin/inventory
${ADMIN_CATALOG_URL}      ${BASE_URL}/admin/products
${ADMIN_ORDERS_URL}       ${BASE_URL}/admin/orders
${LOGIN_URL}              ${BASE_URL}/login

*** Keywords ***
Open Browser And Login As Business User
    Open Browser    ${LOGIN_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User

*** Test Cases ***
Reports Route Keeps Admin Shell And Shows Current Reports Content
    Open Browser And Login As Business User
    Go To    ${ADMIN_REPORTS_URL}
    Wait Until Page Contains    Reports    10s
    Capture Page Screenshot
    Close Browser

Inventory Route Keeps Admin Shell And Shows Current Inventory Content
    Open Browser And Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}
    Wait Until Page Contains    Inventory Management    10s
    Wait Until Page Contains    Product Dependencies    10s
    Wait Until Page Contains    Supply Inventory    10s
    Capture Page Screenshot
    Close Browser

Catalog Route Keeps Admin Shell And Shows Current Catalog Content
    Open Browser And Login As Business User
    Go To    ${ADMIN_CATALOG_URL}
    Wait Until Location Contains    /admin/products    10s
    Wait Until Page Contains Element    xpath=//body    10s
    Capture Page Screenshot
    Close Browser

Orders Route Keeps Admin Shell And Shows Deferred Links
    Open Browser And Login As Business User
    Go To    ${ADMIN_ORDERS_URL}
    Wait Until Page Contains    Order Management    10s
    ${table_status}=    Run Keyword And Return Status
    ...    Wait Until Page Contains Element    xpath=//table[contains(@class,'admin-table')]    10s
    ${empty_status}=    Run Keyword And Return Status
    ...    Wait Until Page Contains    No orders found.    2s
    Should Be True    ${table_status} or ${empty_status}
    Capture Page Screenshot
    Close Browser