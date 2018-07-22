const CLIENT_ID = '97685359086-lhe16dl0llnlvhaibnoiqblmanfbdnbn.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');

let tmpVideos = [];

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        getChannel();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function getChannel() {
    gapi.client.youtube.channels.list({
        'part': 'snippet,contentDetails',
        'mine': true
    }).then(function (response) {
        getUploads(response.result.items[0].contentDetails.relatedPlaylists.uploads)
    });
}

function getUploads(uploadsId, nextPage) {
    const requestOptions = {
        playlistId: uploadsId,
        part: 'snippet',
        maxResults: 50
    };
    if (nextPage) requestOptions.pageToken = nextPage;
    gapi.client.youtube.playlistItems.list(requestOptions).then(res => {
        tmpVideos = [...tmpVideos, ...res.result.items];
        if (res.result.nextPageToken) {
            getUploads(uploadsId, res.result.nextPageToken)
        } else {
            getVideos();
        }
    });
}

function getVideos() {
    tmpVideos.forEach((item) => {
            gapi.client.youtube.videos.list({
                id: item.snippet.resourceId.videoId,
                part: "snippet,contentDetails,statistics"
            }).then(res => {
                console.log(res.result);
                gapi.client.youtube.videos.update({ //cant update
                        "part": 'snippet', // maybe because of Google+ API
                    },
                    ({
                        'id': res.result.items[0].id,
                        'kind': res.result.items[0].kind,
                        'snippet.categoryId': res.result.items[0].snippet.categoryId,
                        'snippet.title': res.result.items[0].snippet.title,
                        'snippet.description': 'wow ' + res.result.items[0].snippet.description
                    })).then((res) => console.log(res))
            });
        }
    )
}