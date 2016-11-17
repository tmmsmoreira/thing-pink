<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta name="description" content="#TweetSearch">
    <meta name="author" content="Tiago Moreira">

    <title>#TweetSearch</title>

    <!-- Styles -->
    <link href="css/app.css" rel="stylesheet" type="text/css">
</head>
<body>
    <div id="root"></div>
    <meta name="_token" content="{{ csrf_token() }}" />
    <script src="https://unpkg.com/react@latest/dist/react.js"></script>
    <script src="https://unpkg.com/react-dom@latest/dist/react-dom.js"></script>
    <script src="https://unpkg.com/react-router/umd/ReactRouter.min.js"></script>
    <script src="https://unpkg.com/babel-standalone@6.15.0/babel.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="js/app.js"></script>
    <script src="js/jquery.idb.min.js"></script>
    <script type="text/babel" src="js/app.jsx"></script>
</body>
</html>
