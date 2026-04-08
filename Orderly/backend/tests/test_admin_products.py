*** Settings ***
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
    Login As Test User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/admin/products
    Wait Until Location Is    ${BASE_URL}/    10s
    Page Should Not Contain    Admin Products

Business User Can Access Admin Products
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Location Should Be    ${BASE_URL}/admin/products

Admin Can Create Product
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    ${product_name}=    Set Variable    Robot Product ${TEST NAME}
    ${description}=    Set Variable    Created by Robot

    Input Text    name=name    ${product_name}
    Select From List By Value    name=category    1
    Select From List By Value    name=supplier    1
    Input Text    name=description    ${description}
    Click Button    xpath=//button[normalize-space()='Create Product']

    Wait Until Page Contains    ${product_name}    10s

Admin Can Edit Product
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    ${original_name}=    Set Variable    Robot Edit Source ${TEST NAME}
    ${updated_name}=    Set Variable    Robot Product Updated ${TEST NAME}
    ${updated_desc}=    Set Variable    Updated by Robot

    Create Admin Product    ${original_name}    Original description

    Click Edit For Product    ${original_name}
    Wait Until Page Contains    Edit Product    10s

    Clear Element Text    name=name
    Input Text    name=name    ${updated_name}
    Clear Element Text    name=description
    Input Text    name=description    ${updated_desc}
    Click Button    xpath=//button[normalize-space()='Update Product']

    Wait Until Page Contains    ${updated_name}    10s
    Page Should Not Contain    ${original_name}

Admin Can Cancel Edit Product
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    ${product_name}=    Set Variable    Robot Cancel Source ${TEST NAME}
    Create Admin Product    ${product_name}    Cancel me

    Click Edit For Product    ${product_name}
    Wait Until Page Contains    Edit Product    10s
    Page Should Contain Button    Cancel

    Clear Element Text    name=name
    Input Text    name=name    Temp Changed Name
    Click Button    xpath=//button[normalize-space()='Cancel']

    Wait Until Page Contains    Create Product    10s
    Element Attribute Value Should Be    name=name    value    
    Page Should Contain    ${product_name}

Admin Can Delete Product
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    ${product_name}=    Set Variable    Robot Delete Source ${TEST NAME}
    Create Admin Product    ${product_name}    Delete me

    Click Delete For Product    ${product_name}
    Wait Until Page Does Not Contain    ${product_name}    10s

Backend Validation Error Surfaces In UI
    Seed Frontend Session As Business User
    Go To    ${BASE_URL}/admin/products
    Wait Until Page Contains    Admin Products    10s
    Wait For Product Form Options

    Select From List By Value    name=category    1
    Select From List By Value    name=supplier    1
    Click Button    xpath=//button[normalize-space()='Create Product']

    Wait Until Page Contains Element    xpath=//p[contains(., 'required') or contains(., 'Validation') or contains(., 'Name')]    10s

*** Keywords ***
Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END

Seed Frontend Session As Business User
    Go To    ${BASE_URL}
    Execute JavaScript
    ...    window.localStorage.setItem('accessToken', 'fake-business-token');
    ...    window.localStorage.setItem('user', JSON.stringify({
    ...      firstName: 'Biz',
    ...      role: 'BUSINESS'
    ...    }));
    Reload Page

Wait For Product Form Options
    Wait Until Page Contains Element    name=category    10s
    Wait Until Page Contains Element    name=supplier    10s
    Wait Until Keyword Succeeds    10s    1s    Page Should Contain Element    xpath=//select[@name='category']/option[@value='1']
    Wait Until Keyword Succeeds    10s    1s    Page Should Contain Element    xpath=//select[@name='supplier']/option[@value='1']

Create Admin Product
    [Arguments]    ${product_name}    ${description}
    Wait For Product Form Options
    Input Text    name=name    ${product_name}
    Select From List By Value    name=category    1
    Select From List By Value    name=supplier    1
    Input Text    name=description    ${description}
    Click Button    xpath=//button[normalize-space()='Create Product']
    Wait Until Page Contains    ${product_name}    10s

Click Edit For Product
    [Arguments]    ${product_name}
    Click Element    xpath=//tr[td[normalize-space()='${product_name}']]//button[normalize-space()='Edit']

Click Delete For Product
    [Arguments]    ${product_name}
    Click Element    xpath=//tr[td[normalize-space()='${product_name}']]//button[normalize-space()='Delete']