*** Settings ***
Documentation     F5.5 / UX 5.5 Low Stock Indicators - Admin Inventory Robot Tests
Library           SeleniumLibrary
Variables         ../variables/variables.py
Resource          ../resources/keywords.robot
Suite Setup       Open Browser To App
Suite Teardown    Close Browser
Test Setup        Login As Business User And Open Inventory Page

*** Variables ***
${INVENTORY_URL}            ${BASE_URL}/admin/inventory
${SUPPLY_HEADER}            xpath=//h3[contains(normalize-space(.),'Supply Inventory')]
${DEPENDENCIES_HEADER}      xpath=//*[contains(normalize-space(.),'Product Dependencies')]
${SUPPLY_TABLE}             xpath=(//h3[contains(normalize-space(.),'Supply Inventory')]/following::table[contains(@class,'admin-table')])[1]

*** Test Cases ***
Business Admin Can Open Inventory Page With Low Stock Indicators
    [Documentation]    Confirms the inventory page loads and inventory controls are visible.
    Wait For Inventory Page To Finish Loading
    Page Should Contain    Supply Inventory
    Page Should Contain    Current Stock
    Page Should Contain    Reorder Level
    Page Should Contain Element    ${SUPPLY_TABLE}

Out Of Stock Items Are Not Labeled As Low Stock
    [Documentation]    Verifies a zero-stock seeded item shows Out of Stock and not Low Stock in the supply table.
    Wait Until Supply Row Contains Item    Pumpkin Spice (8oz)
    ${row}=    Get Supply Row By Name    Pumpkin Spice (8oz)
    Element Should Contain       ${row}    OUT OF STOCK
    Element Should Not Contain   ${row}    LOW STOCK

Product Dependencies Section Appears When Low Or Out Of Stock Ingredients Affect Products
    [Documentation]    Confirms impacted products are summarized in the Product Dependencies panel.
    Wait For Inventory Page To Finish Loading
    Wait Until Page Contains Element    ${DEPENDENCIES_HEADER}    20s
    Page Should Contain    Product Dependencies
    Page Should Contain    Product
    Page Should Contain    Depends On

Availability Toggle Exists For Inventory Rows
    [Documentation]    Confirms the row-level availability toggle is rendered for a supply inventory item.
    Wait Until Supply Row Contains Item    Milk
    Page Should Contain Element
    ...    xpath=//label[contains(@aria-label,'Toggle Milk availability')]//input[@type='checkbox']

Save Button Exists For Supply Inventory Rows
    [Documentation]    Confirms inline save action is present on a supply inventory row.
    Wait Until Supply Row Contains Item    Milk
    ${row}=    Get Supply Row By Name    Milk
    Element Should Contain    ${row}    SAVE

*** Keywords ***
Login As Business User And Open Inventory Page
    Login As Business User
    Sync Auth Token Key For Frontend
    Wait Until Business Role Is Stored
    Go To    ${INVENTORY_URL}
    Wait Until Location Contains    /admin/inventory    20s
    ${current_url}=    Get Location
    Should Not Contain    ${current_url}    /login
    Wait For Inventory Page To Finish Loading

Wait Until Business Role Is Stored
    Wait Until Keyword Succeeds    20s    1s    Business Role Should Be Stored

Business Role Should Be Stored
    ${role}=    Execute JavaScript
    ...    const user = JSON.parse(window.localStorage.getItem('user') || '{}'); return (user.role || '').toUpperCase();
    Should Be Equal As Strings    ${role}    BUSINESS

Wait For Inventory Page To Finish Loading
    Wait Until Page Does Not Contain    Loading inventory...    20s
    Wait Until Page Contains Element    ${SUPPLY_HEADER}    20s
    Wait Until Page Contains Element    ${SUPPLY_TABLE}    20s

Get Supply Row By Name
    [Arguments]    ${item_name}
    ${row}=    Get WebElement
    ...    xpath=(//h3[contains(normalize-space(.),'Supply Inventory')]/following::table[contains(@class,'admin-table')])[1]//tr[.//*[contains(normalize-space(.),'${item_name}')]]
    RETURN    ${row}

Wait Until Supply Row Contains Item
    [Arguments]    ${item_name}
    Wait For Inventory Page To Finish Loading
    Wait Until Page Contains Element
    ...    xpath=(//h3[contains(normalize-space(.),'Supply Inventory')]/following::table[contains(@class,'admin-table')])[1]//tr[.//*[contains(normalize-space(.),'${item_name}')]]
    ...    20s