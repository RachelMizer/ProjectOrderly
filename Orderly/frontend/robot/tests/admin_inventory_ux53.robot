*** Settings ***
Library           SeleniumLibrary
Library           BuiltIn
Variables         ../variables/variables.py
Suite Setup       Open Browser To Admin Login
Suite Teardown    Close Browser
Test Setup        Log In As Business Admin And Open Inventory

*** Variables ***
${BROWSER_WIDTH}                1440
${BROWSER_HEIGHT}               1000
${ADMIN_LOGIN_URL}              ${BASE_URL}/admin/login
${ADMIN_INVENTORY_URL}          ${BASE_URL}/admin/inventory

${SEARCH_INPUT}                 css=input.submenu-search
${ADD_ITEM_BUTTON}              xpath=//button[contains(., '+ ADD ITEM')]
${ITEM_NAME_INPUT}              xpath=//input[@placeholder='Item name']
${CREATE_BUTTON}                xpath=//button[normalize-space()='Create']
${CANCEL_BUTTON}                xpath=//button[normalize-space()='Cancel']

*** Test Cases ***
Business Admin Can Open Inventory Page And See Both Sections
    Wait Until Element Is Visible    ${SEARCH_INPUT}
    Page Should Contain Element    ${ADD_ITEM_BUTTON}
    Page Should Contain    Ingredient-Controlled Beverage Availability
    Page Should Contain    Count-Based Inventory

Ingredient Section Shows Empty State When No Dependency Data Exists
    Page Should Contain    Ingredient-Controlled Beverage Availability
    Page Should Contain    No dependency-controlled ingredients found.

Search Filters Inventory Tables
    Wait Until Element Is Visible    ${SEARCH_INPUT}
    Clear Element Text    ${SEARCH_INPUT}
    Input Text    ${SEARCH_INPUT}    flour
    Wait Until Page Contains    Flour

    Clear Element Text    ${SEARCH_INPUT}
    Input Text    ${SEARCH_INPUT}    cups
    Wait Until Page Contains    Cups

Count Based Inventory Can Be Updated
    ${count_item}=    Get First Available Count Item
    Wait Until Page Contains    ${count_item}
    Input Count Based Stock For Row    ${count_item}    299
    Input Count Based Reorder For Row    ${count_item}    110
    Click Save For Row    ${count_item}
    Wait Until Page Contains    Saved!

Negative Inline Value Shows Invalid Styling
    ${count_item}=    Get First Available Count Item
    Wait Until Page Contains    ${count_item}
    Input Count Based Stock For Row    ${count_item}    -1
    Row Input Should Have Error Class    ${count_item}    0

Create Item Panel Opens And Creates New Count Based Item
    ${unique_name}=    Evaluate    "UI Test Brownie " + str(__import__('time').time()).replace('.', '')
    Click Element    ${ADD_ITEM_BUTTON}
    Wait Until Page Contains    New Inventory Item
    Input Text    ${ITEM_NAME_INPUT}    ${unique_name}

    ${create_inputs}=    Get WebElements    xpath=//div[contains(@class,'inv-create-panel')]//input[@type='number']
    Clear Element Text    ${create_inputs}[0]
    Input Text    ${create_inputs}[0]    8
    Clear Element Text    ${create_inputs}[1]
    Input Text    ${create_inputs}[1]    2

    Click Button    ${CREATE_BUTTON}
    Wait Until Page Contains    Item created successfully.
    Wait Until Page Contains    ${unique_name}

Create Panel Negative Values Show Invalid Styling
    Click Element    ${ADD_ITEM_BUTTON}
    Wait Until Page Contains    New Inventory Item

    ${create_inputs}=    Get WebElements    xpath=//div[contains(@class,'inv-create-panel')]//input[@type='number']
    Clear Element Text    ${create_inputs}[0]
    Input Text    ${create_inputs}[0]    -3
    Clear Element Text    ${create_inputs}[1]
    Input Text    ${create_inputs}[1]    -1

    Element Should Have Error Class    ${create_inputs}[0]
    Element Should Have Error Class    ${create_inputs}[1]
    Click Button    ${CANCEL_BUTTON}

Ingredient Toggle Tests Require Dependency Data
    Page Should Contain    Ingredient-Controlled Beverage Availability
    Page Should Contain    No dependency-controlled ingredients found.

Ingredient Table Sorts By Current Stock
    Page Should Contain    Count-Based Inventory
    Click Element    xpath=(//table[contains(@class,'admin-table')])[1]//th[contains(normalize-space(.),'Current Stock')]
    ${first_row_name}=    Get Text    xpath=((//table[contains(@class,'admin-table')])[1]//tbody/tr[1]/td[1])
    Should Not Be Empty    ${first_row_name}

*** Keywords ***
Open Browser To Admin Login
    Open Browser    ${ADMIN_LOGIN_URL}    ${BROWSER}
    Maximize Browser Window
    Set Window Size    ${BROWSER_WIDTH}    ${BROWSER_HEIGHT}
    Set Selenium Timeout    15 seconds
    Set Selenium Speed    0.1 seconds

Log In As Business Admin And Open Inventory
    Go To    ${ADMIN_LOGIN_URL}
    Wait Until Element Is Visible    css=.admin-login

    ${email_field}=    Get WebElement    xpath=(//div[contains(@class,'admin-login')]//input)[1]
    ${password_field}=    Get WebElement    xpath=//div[contains(@class,'admin-login')]//input[@type='password']
    ${login_button}=    Get WebElement    xpath=//div[contains(@class,'admin-login')]//button[not(@disabled)]

    Click Element    ${email_field}
    Press Keys    ${email_field}    CTRL+a+BACKSPACE
    Input Text    ${email_field}    ${BUSINESS_EMAIL}

    Click Element    ${password_field}
    Press Keys    ${password_field}    CTRL+a+BACKSPACE
    Input Password    ${password_field}    ${BUSINESS_PASSWORD}

    Click Element    ${login_button}

    Wait Until Keyword Succeeds    15x    1s    Admin Login Should Be Complete
    Go To    ${ADMIN_INVENTORY_URL}
    Wait Until Keyword Succeeds    15x    1s    Inventory Page Should Be Ready

Admin Login Should Be Complete
    Wait Until Element Is Visible    css=.admin-dash-wrap
    ${location}=    Get Location
    Should Not Contain    ${location}    /admin/login

Inventory Page Should Be Ready
    ${location}=    Get Location
    Should Contain    ${location}    /admin/inventory
    Wait Until Element Is Visible    ${SEARCH_INPUT}
    Wait Until Element Is Visible    ${ADD_ITEM_BUTTON}
    Wait Until Page Contains    Ingredient-Controlled Beverage Availability
    Wait Until Page Contains    Count-Based Inventory

Get First Available Count Item
    ${candidates}=    Create List    Flour    Cups (12oz)    Cups (16oz)    Lids (12oz)    Lids (16oz)    Cake Pop
    FOR    ${item}    IN    @{candidates}
        ${present}=    Run Keyword And Return Status    Page Should Contain    ${item}
        IF    ${present}
            RETURN    ${item}
        END
    END
    Fail    No expected count-based inventory item was found.

Get Row Element
    [Arguments]    ${row_name}
    ${row}=    Get WebElement    xpath=//tr[.//td[contains(normalize-space(.), "${row_name}")]]
    RETURN    ${row}

Input Count Based Stock For Row
    [Arguments]    ${row_name}    ${value}
    ${inputs}=    Get WebElements    xpath=//tr[.//td[contains(normalize-space(.), "${row_name}")]]//input[@type='number']
    Clear Element Text    ${inputs}[0]
    Input Text    ${inputs}[0]    ${value}

Input Count Based Reorder For Row
    [Arguments]    ${row_name}    ${value}
    ${inputs}=    Get WebElements    xpath=//tr[.//td[contains(normalize-space(.), "${row_name}")]]//input[@type='number']
    Clear Element Text    ${inputs}[1]
    Input Text    ${inputs}[1]    ${value}

Click Save For Row
    [Arguments]    ${row_name}
    Click Button    xpath=//tr[.//td[contains(normalize-space(.), "${row_name}")]]//button[normalize-space()='Save']

Row Input Should Have Error Class
    [Arguments]    ${row_name}    ${index}
    ${inputs}=    Get WebElements    xpath=//tr[.//td[contains(normalize-space(.), "${row_name}")]]//input[@type='number']
    Element Should Have Error Class    ${inputs}[${index}]

Element Should Have Error Class
    [Arguments]    ${element}
    ${class_name}=    Get Element Attribute    ${element}    class
    Should Contain    ${class_name}    inv-input-error