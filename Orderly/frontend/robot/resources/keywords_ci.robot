*** Settings ***
Library    SeleniumLibrary
Variables  ../variables/variables_ci.py

*** Keywords ***
Open Browser To App
    ${options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver

    IF    ${HEADLESS}
        Call Method    ${options}    add_argument    --headless=new
    END

    Call Method    ${options}    add_argument    --no-sandbox
    Call Method    ${options}    add_argument    --disable-dev-shm-usage
    Call Method    ${options}    add_argument    --window-size=1920,1080

    Open Browser    ${BASE_URL}    ${BROWSER}    options=${options}
    Set Selenium Timeout    10 seconds

Close Browser Session
    Close Browser

Go To Login Page
    Go To    ${BASE_URL}/login
    Wait Until Page Contains Element    name=email    10s

Login As Test User
    Go To Login Page
    Input Text    name=email    ${TEST_EMAIL}
    Input Password    name=password    ${TEST_PASSWORD}
    Click Button    xpath=//button[normalize-space()='Login']

    Sync Auth Token Key For Frontend

    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s

Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=   Execute JavaScript    return window.localStorage.getItem('accessToken');

    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END