*** Settings ***
Documentation     F5.5 / UX 5.5 Low Stock Indicators - Admin Inventory Robot Tests
Library           SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot
Suite Setup       Open Browser To App
Suite Teardown    Close Browser
Test Setup        Login As Business User And Open Inventory Page

*** Variables ***
${INVENTORY_URL}            ${BASE_URL}/admin/inventory
${SUPPLY_HEADER}            xpath=//h3[normalize-space()='Supply Inventory']
${DEPENDENCIES_HEADER}      xpath=//*[normalize-space()='Product Dependencies']
${SUPPLY_TABLE}             xpath=(//h3[normalize-space()='Supply Inventory']/following::table[contains(@class,'admin-table')])[1]

*** Test Cases ***
Business Admin Can Open Inventory Page With Low Stock Indicators
    [Documentation]    Confirms the inventory page loads and inventory controls are visible.
    Wait Until Page Contains Element    ${SUPPLY_HEADER}    15s
    Wait Until Page Contains Element    ${SUPPLY_TABLE}    15s
    Page Should Contain                 Supply Inventory
    Page Should Contain                 Current Stock
    Page Should Contain                 Reorder Level

Out Of Stock Items Are Not Labeled As Low Stock
    [Documentation]    Verifies a zero-stock seeded item shows OUT OF STOCK and not Low Stock in the supply table.
    Wait Until Supply Row Contains Item    Pumpkin Spice (8oz)
    ${row}=    Get Supply Row By Name    Pumpkin Spice (8oz)
    Element Should Contain       ${row}    OUT OF STOCK
    Element Should Not Contain   ${row}    Low Stock

Product Dependencies Section Appears When Low Or Out Of Stock Ingredients Affect Products
    [Documentation]    Confirms impacted products are summarized in the Product Dependencies panel.
    Wait Until Page Contains Element    ${DEPENDENCIES_HEADER}    15s
    Page Should Contain                 Product Dependencies
    Page Should Contain                 Product
    Page Should Contain                 Depends On

Availability Toggle Exists For Inventory Rows
    [Documentation]    Confirms the row-level availability toggle is rendered for a supply inventory item.
    Wait Until Supply Row Contains Item    Milk
    Page Should Contain Element
    ...    xpath=//label[@aria-label='Toggle Milk availability']//input[@type='checkbox']

Save Button Exists For Supply Inventory Rows
    [Documentation]    Confirms inline save action is present on a supply inventory row.
    Wait Until Supply Row Contains Item    Milk
    ${row}=    Get Supply Row By Name    Milk
    Element Should Contain       ${row}    SAVE
    
*** Keywords ***
Open Low Stock Test Browser
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Timeout    15s

Login As Business User And Open Inventory Page
    Login As Business User
    Go To    ${INVENTORY_URL}
    Wait Until Page Contains Element    ${SUPPLY_HEADER}    15s
    Wait Until Page Contains Element    ${SUPPLY_TABLE}    15s

Get Supply Row By Name
    [Arguments]    ${item_name}
    ${row}=    Get WebElement
    ...    xpath=(//h3[normalize-space()='Supply Inventory']/following::table[contains(@class,'admin-table')])[1]//tr[.//*[contains(normalize-space(),'${item_name}')]]
    RETURN    ${row}

Wait Until Supply Row Contains Item
    [Arguments]    ${item_name}
    Wait Until Page Contains Element
    ...    xpath=(//h3[normalize-space()='Supply Inventory']/following::table[contains(@class,'admin-table')])[1]//tr[.//*[contains(normalize-space(),'${item_name}')]]
    ...    15s