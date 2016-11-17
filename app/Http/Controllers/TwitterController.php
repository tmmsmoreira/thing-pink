<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Libraries\TwitterProxy;

class TwitterController extends Controller
{
    public function getTweets(Request $request)
    {
        // Twitter OAuth Config options
        $twitter_OAuth_data = config('twitter');
        $tweets = array("statuses"=>array());

        $screen_name = 'parallax';
        $count = 20;

        $twitter_url = 'search/tweets.json';
        switch($request->type) {
            case "next":
                if (isset($request->metadata['next_results'])) {
                    $twitter_url .= $request->metadata['next_results'];
                } else {
                    $twitter_url = "";
                }
                break;
            default:
                $twitter_url .= '?q=' . str_replace(" ", "+", urlencode($request->search));
                $twitter_url .= '&count=' . $count;
                $twitter_url .= '&result_type=recent';
                break;
        }

        if (!empty($twitter_url)) {
            // Create a Twitter Proxy object from our twitter_proxy.php class
            $twitter_proxy = new TwitterProxy(
            	$twitter_OAuth_data['oauth_access_token'],			// 'Access token' on https://apps.twitter.com
            	$twitter_OAuth_data['oauth_access_token_secret'],	// 'Access token secret' on https://apps.twitter.com
            	$twitter_OAuth_data['consumer_key'],				// 'API key' on https://apps.twitter.com
            	$twitter_OAuth_data['consumer_secret'],				// 'API secret' on https://apps.twitter.com
                $twitter_OAuth_data['user_id'],					    // User id (http://gettwitterid.com/)
            	$screen_name,					                    // Twitter handle
            	$count							                    // The number of tweets to pull out
            );

            // Invoke the get method to retrieve results via a cURL request
            $tweets = $twitter_proxy->get($twitter_url);
        }

        return $tweets;
    }
}
