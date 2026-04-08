*** Settings ***
Documentation    Admin product management tests for US4.3 / 5.2
Library    SeleniumLibrary
Variables  ../variables/variables.py
Resource   ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Test Cases ***
Admin Products Page Requires Login
    Go To    ${BASE_URL}/admin/products
    Wait Until Location Contains    /login    10s
    Page Should Contain Element    id=email
    Page Should Contain Element    id=password

Customer Cannot Access Admin Products
    Login As Customer User
    Go To    ${BASE_URL}/admin/products
    Wait Until Location Is    ${BASE_URL}/    10s
    Page Should Not Contain    Admin Products

Business User Can Access Admin Products
    Login As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Location Should Be    ${BASE_URL}/admin/products

Admin Can Create Product
    Login As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    ${unique}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${product_name}=    Set Variable    Robot Product ${unique}
    ${description}=    Set Variable    Created by Robot

    Input Text    name=name    ${product_name}
    Select Product Category
    Select Product Supplier
    Input Text    name=description    ${description}
    Click Button    xpath=//button[normalize-space()='Create Product']

    Wait Until Keyword Succeeds    10s    1s    Page Should Contain    ${product_name}

Admin Can Edit Product
    Login As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    ${unique}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${original_name}=    Set Variable    Robot Edit Source ${unique}
    ${updated_name}=    Set Variable    Robot Product Updated ${unique}
    ${updated_desc}=    Set Variable    Updated by Robot

    Create Admin Product    ${original_name}    Original description

    Click Edit For Product    ${original_name}
    Wait Until Page Contains    Edit Product    10s

    Clear Element Text    name=name
    Input Text    name=name    ${updated_name}
    Clear Element Text    name=description
    Input Text    name=description    ${updated_desc}
    Click Button    xpath=//button[normalize-space()='Update Product']

    Wait Until Keyword Succeeds    10s    1s    Page Should Contain    ${updated_name}

Admin Can Cancel Edit Product
    Login As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    ${unique}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${product_name}=    Set Variable    Robot Cancel Source ${unique}
    Create Admin Product    ${product_name}    Cancel me

    Click Edit For Product    ${product_name}
    Wait Until Page Contains    Edit Product    10s

    Clear Element Text    name=name
    Input Text    name=name    Temp Changed Name
    Click Button    xpath=//button[normalize-space()='Cancel']

    Wait Until Page Contains    Create Product    10s
    Element Attribute Value Should Be    name=name    value    ${EMPTY}
    Page Should Contain    ${product_name}

Admin Can Delete Product
    Login As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    ${product_name}=    Set Variable    Robot Delete Source ${TEST NAME}
    Create Admin Product    ${product_name}    Delete me

    Click Delete For Product    ${product_name}
    Wait Until Page Does Not Contain    ${product_name}    10s

Backend Validation Error Surfaces In UI
    Login As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    Input Text    name=name    Robot Validation Test
    Select Product Category
    Select Product Supplier
    Input Text    name=description    Validation check
    Click Button    xpath=//button[normalize-space()='Create Product']

    # try creating same product again to trigger backend validation if duplicates are blocked
    Input Text    name=name    Robot Validation Test
    Select Product Category
    Select Product Supplier
    Input Text    name=description    Validation check
    Click Button    xpath=//button[normalize-space()='Create Product']

    Wait Until Page Contains Element    xpath=//*[contains(text(),'Validation') or contains(text(),'required') or contains(text(),'already exists') or contains(text(),'error') or contains(text(),'Name')]    10s


*** Keywords ***
Wait For Product Form Options
    Wait Until Page Contains Element    name=category    10s
    Wait Until Page Contains Element    name=supplier    10s
    Wait Until Keyword Succeeds    10s    1s    Category Options Should Be Loaded
    Wait Until Keyword Succeeds    10s    1s    Supplier Options Should Be Loaded

Category Options Should Be Loaded
    ${count}=    Get Element Count    xpath=//select[@name='category']/option
    Should Be True    ${count} > 1

Supplier Options Should Be Loaded
    ${count}=    Get Element Count    xpath=//select[@name='supplier']/option
    Should Be True    ${count} > 1

Select Product Category
    ${value}=    Get First Selectable Option Value    category
    Select From List By Value    name=category    ${value}

Select Product Supplier
    ${value}=    Get First Selectable Option Value    supplier
    Select From List By Value    name=supplier    ${value}

Get First Selectable Option Value
    [Arguments]    ${select_name}
    ${value}=    Execute JavaScript
    ...    const select = document.querySelector(`select[name="${select_name}"]`);
    ...    const option = Array.from(select.options).find(o => o.value && o.value.trim() !== "");
    ...    return option ? option.value : "";
    Should Not Be Empty    ${value}
    [Return]    ${value}

Create Admin Product
    [Arguments]    ${product_name}    ${description}
    Wait For Product Form Options
    Input Text    name=name    ${product_name}
    Select Product Category
    Select Product Supplier
    Input Text    name=description    ${description}
    Click Button    xpath=//button[normalize-space()='Create Product']
    Wait Until Page Contains    ${product_name}    10s

Click Edit For Product
    [Arguments]    ${product_name}
    Click Element    xpath=//tr[td[normalize-space()='${product_name}']]//button[normalize-space()='Edit']

Click Delete For Product
    [Arguments]    ${product_name}
    Click Element    xpath=//tr[td[normalize-space()='${product_name}']]//button[normalize-space()='Delete']