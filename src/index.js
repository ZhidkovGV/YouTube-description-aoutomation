const start = () => {
        gapi.client.init({
            'apiKey': 'AIzaSyDcK82q0HarhU9ISfH4hjKRZZ0vwdR0_Aw',
            // Your API key will be automatically added to the Discovery Document URLs.
            'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
            // clientId and scope are optional if auth is not required.
            'clientId': '1089365127935-1ets6q659t9v0g02kged3jirhrc3ideo.apps.googleusercontent.com',
            'scope': 'profile',
        }).then(res => res.json()).then(res => console.log(res))
    };
gapi.load('client', start);