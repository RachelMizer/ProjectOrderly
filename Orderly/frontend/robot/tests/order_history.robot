*** Settings ***
Resource   ../resources/keywords.robot
Test Setup     Open Browser To App
Test Teardown  Close Browser Session

*** Test Cases ***
Logged In User Can View Order History Page
    Login As Test User
    Open Order History Page
    Wait Until Page Contains    Order History    10s
    Page Should Contain Element    xpath=//button[normalize-space()='Previous']
    Page Should Contain Element    xpath=//button[normalize-space()='Next']

Past Orders Display Correctly
    Login As Test User
    Open Order History Page
    Wait Until Page Contains    Order History    10s
    Wait For Order History To Load
    Page Should Not Contain    Loading order history...
    Page Should Contain    Status:
    Page Should Contain    Total: $
    Page Should Contain Element    xpath=//strong[starts-with(normalize-space(),'Order #')]

Customer Can Click Past Order To View Detail
    Login As Test User
    Open Order History Page
    Wait Until Page Contains    Order History    10s
    Wait For Order History To Load

    ${order_text}=    Get Text    xpath=(//strong[starts-with(normalize-space(),'Order #')])[1]
    ${order_id}=    Evaluate    "${order_text}".replace("Order #","").strip()

    Click First Order Card

    Wait Until Page Contains    Order #${order_id}    10s
    Page Should Contain    Items
    Page Should Contain    Totals
    Page Should Contain    Tax:
    Page Should Contain    Total: $

Order History Shows Empty State When No Past Orders Exist
    [Documentation]    Run this only with a test user that has no non-draft orders.
    Login As Empty Order History User
    Open Order History Page
    Wait Until Page Contains    Order History    10s
    Wait Until Page Contains    No past orders found.    10s

*** Keywords ***
Open Order History Page
    Click Link    Order History
    Wait Until Page Contains    Order History    10s

Wait For Order History To Load
    Wait Until Keyword Succeeds    10x    1s    Order History Should Be Ready

Order History Should Be Ready
    Page Should Not Contain    Loading order history...
    Page Should Not Contain    Failed to fetch order history

Click First Order Card
    Click Element    xpath=(//strong[starts-with(normalize-space(),'Order #')]/ancestor::div[1])[1]

Login As Empty Order History User
    Go To Login Page
    Input Text    id=email    ${EMPTY_HISTORY_EMAIL}
    Input Password    id=password    ${EMPTY_HISTORY_PASSWORD}
    Click Button    xpath=//button[normalize-space()='Login']
    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s