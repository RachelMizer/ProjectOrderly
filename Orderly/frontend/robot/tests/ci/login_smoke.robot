*** Settings ***
Resource    ../resources/keywords_ci.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Test Cases ***
CI User Can Log In And See Authenticated Navigation
    Login As Test User
    Page Should Not Contain Link    Login