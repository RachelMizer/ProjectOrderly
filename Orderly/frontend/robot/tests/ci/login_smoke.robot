*** Settings ***
Resource    ../resources/keywords_ci.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Test Cases ***
CI User Can Log In And See Authenticated Navigation
    Login As Test User

    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Page Should Contain Link    Profile

    Wait Until Page Contains Element    xpath=//a[@href='/order-history']    10s
    Page Should Contain Link    Order History

    Page Should Not Contain Link    Login
    Page Should Not Contain Link    Register