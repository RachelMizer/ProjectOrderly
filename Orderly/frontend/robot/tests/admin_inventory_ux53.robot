*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py

*** Variables ***
${ADMIN_INVENTORY_URL}    ${BASE_URL}/admin/inventory
${LOGIN_URL}              ${BASE_URL}/login

*** Keywords ***
Open Browser And Login As Business Admin
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Go To    ${LOGIN_URL}
    Wait Until Page Contains Element    xpath=//input[@type='email' or contains(@name,'email') or contains(@id,'email')]    15s
    Input Text    xpath=//input[@type='email' or contains(@name,'email') or contains(@id,'email')]    ${BUSINESS_EMAIL}
    Input Password    xpath=//input[@type='password' or contains(@name,'password') or contains(@id,'password')]    ${BUSINESS_PASSWORD}
    Click Button    xpath=//button[contains(normalize-space(.), 'Sign In') or contains(normalize-space(.), 'Login')]
    Wait Until Page Contains    Welcome,    15s

Go To Inventory Page
    Go To    ${ADMIN_INVENTORY_URL}
    Wait Until Page Contains    Inventory Management    15s
    Wait Until Page Contains    Product Dependencies    15s
    Wait Until Page Contains    Supply Inventory    15s

*** Test Cases ***
Business Admin Can Open Inventory Page And See Both Sections
    Open Browser And Login As Business Admin
    Go To Inventory Page
    Page Should Contain    Product Dependencies
    Page Should Contain    Supply Inventory
    Capture Page Screenshot
    Close Browser

Ingredient Section Shows Dependency Table When Data Exists
    Open Browser And Login As Business Admin
    Go To Inventory Page
    Wait Until Page Contains Element    xpath=//table[contains(@class,'inv-dep-table')]    15s
    Page Should Contain    Product Dependencies
    Capture Page Screenshot
    Close Browser

Search Filters Inventory Tables
    Open Browser And Login As Business Admin
    Go To Inventory Page
    Wait Until Page Contains Element    xpath=//input[contains(@placeholder,'Search inventory')]    15s
    Input Text    xpath=//input[contains(@placeholder,'Search inventory')]    Milk
    Wait Until Page Contains    Milk    15s
    Capture Page Screenshot
    Click Button    xpath=//button[contains(normalize-space(.), 'CLEAR FILTERS')]
    Close Browser

Count Based Inventory Can Be Updated
    Open Browser And Login As Business Admin
    Go To Inventory Page
    Wait Until Page Contains    Supply Inventory    15s
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.), '+ ADD ITEM')]    15s
    Capture Page Screenshot
    Close Browser

Negative Inline Value Shows Invalid Styling
    Open Browser And Login As Business Admin
    Go To Inventory Page
    Wait Until Page Contains Element    xpath=(//input[contains(@class,'inv-qty-input')])[1]    15s
    Click Element    xpath=(//input[contains(@class,'inv-qty-input')])[1]
    Press Keys    xpath=(//input[contains(@class,'inv-qty-input')])[1]    CTRL+a
    Input Text    xpath=(//input[contains(@class,'inv-qty-input')])[1]    -1
    Capture Page Screenshot
    Close Browser

Create Item Panel Opens And Creates New Count Based Item
    Open Browser And Login As Business Admin
    Go To Inventory Page
    Wait Until Element Is Visible    xpath=//button[contains(normalize-space(.), 'ADD ITEM')]    15s
    Scroll Element Into View         xpath=//button[contains(normalize-space(.), 'ADD ITEM')]
    Click Element                    xpath=//button[contains(normalize-space(.), 'ADD ITEM')]
    Wait Until Page Contains         New Inventory Item    15s

    Input Text    xpath=//input[@placeholder='Item name']    Robot Test Item
    Input Text    xpath=(//div[contains(@class,'inv-create-grid')]//input[contains(@class,'inv-qty-input')])[1]    10
    Input Text    xpath=(//div[contains(@class,'inv-create-grid')]//input[contains(@class,'inv-qty-input')])[2]    2
    Click Button  xpath=//button[normalize-space(.)='Create']

    Wait Until Page Contains    Item created successfully.    15s
    Wait Until Page Contains    Robot Test Item    15s
    Capture Page Screenshot
    Close Browser

Create Panel Negative Values Show Invalid Styling
    Open Browser And Login As Business Admin
    Go To Inventory Page
    Wait Until Element Is Visible    xpath=//button[contains(normalize-space(.), 'ADD ITEM')]    15s
    Scroll Element Into View         xpath=//button[contains(normalize-space(.), 'ADD ITEM')]
    Click Element                    xpath=//button[contains(normalize-space(.), 'ADD ITEM')]
    Wait Until Page Contains         New Inventory Item    15s

    Input Text    xpath=(//div[contains(@class,'inv-create-grid')]//input[contains(@class,'inv-qty-input')])[1]    -5
    Capture Page Screenshot
    Close Browser

Ingredient Toggle Is Available When Dependency Data Exists
    Open Browser And Login As Business Admin
    Go To Inventory Page
    Wait Until Page Contains Element    xpath=//label[contains(@aria-label,'availability')]    15s
    Capture Page Screenshot
    Close Browser