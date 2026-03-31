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

Order History Shows Empty State When No Past Orders Exist
    Login As Test User
    Open Order History Page
    Wait Until Page Contains    Order History    10s
    Wait For Order History To Finish Loading
    Page Should Contain    No past orders found.

*** Keywords ***
Open Order History Page
    Click Link    Order History
    Wait Until Page Contains    Order History    10s

Wait For Order History To Finish Loading
    Wait Until Keyword Succeeds    10x    1s    Order History Should Be Finished

Order History Should Be Finished
    Page Should Not Contain    Loading order history...