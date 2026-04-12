*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot

*** Variables ***
${ADMIN_URL}              ${BASE_URL}/admin
${ADMIN_CATALOG_URL}      ${BASE_URL}/admin/catalog
${ADMIN_INVENTORY_URL}    ${BASE_URL}/admin/inventory
${ADMIN_REPORTS_URL}      ${BASE_URL}/admin/reports
${ADMIN_ORDERS_URL}       ${BASE_URL}/admin/orders

*** Test Cases ***
Business Admin Can Access Admin Dashboard Shell
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_URL}

    Wait Until Page Contains    Dashboard Home    10s
    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Reports    10s
    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains    Orders    10s
    Capture Page Screenshot
    Close Browser

Reports Route Keeps Admin Shell And Shows Deferred Links
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_REPORTS_URL}

    Wait Until Page Contains    Reports    10s
    Wait Until Page Contains    Recent Reports    10s
    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Logout    10s
    Capture Page Screenshot
    Close Browser

Inventory Route Keeps Admin Shell And Shows Deferred Links
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Recent Inventory Reports    10s
    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Logout    10s
    Capture Page Screenshot
    Close Browser

Catalog Route Keeps Admin Shell And Shows Product Catalog
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_CATALOG_URL}

    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.), 'CREATE NEW PRODUCT')]    10s
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.), 'ADD SUPPLIER')]    10s
    Capture Page Screenshot
    Close Browser

Orders Route Keeps Admin Shell And Shows Orders Page
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_ORDERS_URL}

    Wait Until Page Contains    Orders    10s
    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Recent Orders    10s
    Capture Page Screenshot
    Close Browser

Dashboard Nav Cards Route To All Admin Sections
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_URL}

    Wait Until Page Contains    Dashboard Home    10s

    Click Link    Reports
    Wait Until Page Contains    Reports    10s

    Go To    ${ADMIN_URL}
    Click Link    Inventory
    Wait Until Page Contains    Inventory    10s

    Go To    ${ADMIN_URL}
    Click Link    Product Catalog
    Wait Until Page Contains    Product Catalog    10s

    Go To    ${ADMIN_URL}
    Click Link    Orders
    Wait Until Page Contains    Orders    10s

    Capture Page Screenshot
    Close Browser

Account Settings Opens From Admin Shell
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_URL}

    Wait Until Page Contains Element    xpath=//a[contains(@href, '/admin/account')]    10s
    Click Element    xpath=//a[contains(@href, '/admin/account')]
    Wait Until Location Contains    /admin/account    10s
    Wait Until Page Contains    Account Settings    10s
    Capture Page Screenshot
    Close Browser

Logged Out User Is Redirected To Admin Login
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Go To    ${ADMIN_URL}

    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains    Sign In    10s
    Capture Page Screenshot
    Close Browser

Customer User Cannot Access Admin Shell
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Customer User
    Go To    ${ADMIN_URL}

    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains    Sign In    10s
    Capture Page Screenshot
    Close Browser