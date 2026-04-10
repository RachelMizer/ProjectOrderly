*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot

*** Test Cases ***
Business Admin Can Open Inventory Page
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Click Link    Admin Dashboard
    Click Link    Inventory
    Wait Until Page Contains    Admin Inventory    10s
    Page Should Contain    Create Inventory Item
    Page Should Contain    Ingredient-Controlled Beverage Availability
    Page Should Contain    Count-Based Inventory Items
    Close Browser

Business Admin Can Set Ingredient Stock To Zero
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${BASE_URL}/admin/inventory

    Wait Until Page Contains    Ingredient-Controlled Beverage Availability    10s
    Wait Until Page Contains    Milk    10s

    ${milk_stock_input}=    Get WebElement    xpath=//strong[normalize-space()='Milk']/ancestor::div[1]//label[contains(.,'Stock Quantity:')]//input
    ${milk_reorder_input}=    Get WebElement    xpath=//strong[normalize-space()='Milk']/ancestor::div[1]//label[contains(.,'Reorder Level:')]//input
    ${milk_save_button}=    Get WebElement    xpath=//strong[normalize-space()='Milk']/ancestor::div[1]//button[normalize-space()='Save']

    Execute JavaScript    const input = arguments[0]; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(input, '0'); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));    ARGUMENTS    ${milk_stock_input}
    Execute JavaScript    const input = arguments[0]; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(input, '0'); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));    ARGUMENTS    ${milk_reorder_input}

    ${stock_value}=    Get Value    ${milk_stock_input}
    ${reorder_value}=    Get Value    ${milk_reorder_input}
    Should Be Equal    ${stock_value}    0
    Should Be Equal    ${reorder_value}    0

    Click Element    ${milk_save_button}

    Wait Until Keyword Succeeds    10s    1s    Page Should Contain    UNAVAILABLE
    Close Browser

Business Admin Can Create Inventory Item
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Business User
    Go To    ${BASE_URL}/admin/inventory

    Wait Until Page Contains    Create Inventory Item    10s

    ${create_name}=    Get WebElement    xpath=(//h3[normalize-space()='Create Inventory Item']/following::input[@type='text'])[1]
    ${create_stock}=    Get WebElement    xpath=(//h3[normalize-space()='Create Inventory Item']/following::input[@type='number'])[1]
    ${create_reorder}=    Get WebElement    xpath=(//h3[normalize-space()='Create Inventory Item']/following::input[@type='number'])[2]
    ${create_button}=    Get WebElement    xpath=//h3[normalize-space()='Create Inventory Item']/following::button[normalize-space()='Create'][1]

    Input Text    ${create_name}    Robot Test Item
    Input Text    ${create_stock}    5
    Input Text    ${create_reorder}    2
    Click Element    ${create_button}

    Wait Until Page Contains    Robot Test Item    10s
    Close Browser

Customer Cannot Access Inventory Page
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Login As Customer User
    Go To    ${BASE_URL}/admin/inventory

    Wait Until Page Does Not Contain    Admin Inventory    10s
    Wait Until Page Contains    Home    10s
    Close Browser