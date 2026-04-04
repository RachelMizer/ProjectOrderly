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
    Run Keyword If Test Failed    Capture Page Screenshot
    Close Browser

Go To Login Page
    Go To    ${BASE_URL}/login
    Wait Until Element Is Visible    xpath=//input[@type='email' or @id='email']    10s

Login As Test User
    Go To Login Page

    Wait Until Element Is Visible    xpath=//input[@type='email' or @id='email']    10s
    Input Text    xpath=//input[@type='email' or @id='email']    ${TEST_EMAIL}

    Wait Until Element Is Visible    xpath=//input[@type='password' or @id='password']    10s
    Input Password    xpath=//input[@type='password' or @id='password']    ${TEST_PASSWORD}

    Click Element    xpath=//button[@type='submit']

    Sync Auth Token Key For Frontend

    Wait Until Page Does Not Contain Element    xpath=//button[@type='submit']    10s

Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=   Execute JavaScript    return window.localStorage.getItem('accessToken');

    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END