*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot

*** Variables ***
${ADMIN_INVENTORY_URL}    ${BASE_URL}/admin/inventory

*** Test Cases ***
Business Admin Can Open Inventory Page
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Welcome,    10s
    Wait Until Page Contains    Track and update stock levels for all inventory items    10s
    Wait Until Page Contains    Return to Dashboard    10s
    Wait Until Page Contains    Inventory Management    10s
    Capture Page Screenshot
    Close Browser

Business Admin Sees Admin Layout On Inventory Page
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Reports    10s
    Wait Until Page Contains    Product Catalog    10s
    Wait Until Page Contains    Orders    10s
    Wait Until Page Contains    Account Settings    10s
    Wait Until Page Contains    Logout    10s
    Capture Page Screenshot
    Close Browser

Inventory Sidebar Shows Current Sidebar Content
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Contains    Inventory    10s
    Wait Until Page Contains    Track and update stock levels for all inventory items    10s
    Element Should Be Visible    xpath=//a[contains(normalize-space(.), 'Return to Dashboard')]
    Capture Page Screenshot
    Close Browser

Customer Cannot Access Inventory Page
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Customer User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Does Not Contain    Track and update stock levels for all inventory items    10s
    Wait Until Page Does Not Contain    Return to Dashboard    10s
    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains    Sign In    10s
    Capture Page Screenshot
    Close Browser