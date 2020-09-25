package egg.em.operations;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Build;
import android.util.Pair;

import androidx.annotation.RequiresApi;

import egg.em.classes.Security;
import egg.em.classes.Utilities;
import egg.em.classes.singletons.LoggedUser;

import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Locale;

public class GetLastTestOperation extends AsyncTask<Context, Integer, String> {

    final static String URL = "http://63.32.97.125:5000/api/tests/lasttest/%d";

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    protected String doInBackground(Context... params) {

        LoggedUser user = LoggedUser.getInstance(null);

        if(!Security.isNetworkAvailable(params[0])){
            return "";
        }

        String completeUrl = String.format(Locale.ENGLISH, URL, user.getId());
        java.net.URL url;
        try {
            url = new URL(completeUrl);
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return "";
        }

        Pair<Integer, JSONObject> result = Utilities.getRequestForJson(url, user.createAuthHeader());
        if (result.first.equals(200)){
            JSONObject lastTestJSON = result.second;
            String[] tmpDate = (lastTestJSON.optString("created_at").split("T")[0]).split("-");
            StringBuilder sb = new StringBuilder();
            for (int i = tmpDate.length - 1; i >= 1; i--) {
                sb.append(tmpDate[i]).append("-");
            }
            sb.append(tmpDate[0]);
            String cleanDate = sb.toString();

            return String.format("%s - %s", lastTestJSON.optString("building"), cleanDate);
        }

        return "";
    }
}
