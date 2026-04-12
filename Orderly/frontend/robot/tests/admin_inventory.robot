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
    Wait Until Page Contains    Recent Inventory Reports    10s
    Wait Until Page Contains    Open Inventory Report    10s
    Wait Until Page Contains    Go Back    10s
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

Inventory Sidebar Shows Deferred Action As Inactive
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Contains    Inventory    10s
    Element Should Be Visible    xpath=//span[contains(normalize-space(.), 'Open Inventory Report')]
    Capture Page Screenshot
    Close Browser

Customer Cannot Access Inventory Page
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Customer User
    Go To    ${ADMIN_INVENTORY_URL}

    Wait Until Page Does Not Contain    Recent Inventory Reports    10s
    Wait Until Page Does Not Contain    Open Inventory Report    10s
    Wait Until Page Contains    Orderly    10s
    Wait Until Page Contains    Sign In    10s
    Capture Page Screenshot
    Close Browser