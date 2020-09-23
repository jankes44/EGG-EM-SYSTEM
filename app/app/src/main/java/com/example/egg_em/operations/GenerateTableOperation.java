package com.example.egg_em.operations;

import android.bluetooth.le.ScanFilter;
import android.content.Context;
import android.os.AsyncTask;
import android.os.Build;
import android.util.Log;
import android.util.Pair;
import android.view.Gravity;
import android.widget.TableRow;
import android.widget.TextView;

import androidx.annotation.RequiresApi;

import com.example.egg_em.classes.Security;
import com.example.egg_em.classes.Utilities;
import com.example.egg_em.classes.singletons.LoggedUser;
import com.example.egg_em.classes.types.RequestType;
import com.example.egg_em.operations.params.TestParams;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.nio.channels.AsynchronousChannelGroup;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;


public class GenerateTableOperation extends AsyncTask<Context, Integer, List<TableRow>> {

    private static String URL = "http://63.32.97.125:5000/api/trialtests/usr/%d/%d";

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    protected List<TableRow> doInBackground(Context ... params) {

        LoggedUser user = LoggedUser.getInstance(null);
        String completeUrl = String.format(Locale.ENGLISH, URL, user.getId(), 20);
        URL url;
        try {
            url = new URL(completeUrl);
        } catch (MalformedURLException e) {
            Log.e("EXCEPTION", e.toString());
            return null;
        }

        String cleanToken = user.getToken()
                .replace("\"", "")
                .replace("\n", "");
        List<Pair<String, String>> headers = new LinkedList<>();
        headers.add(new Pair<>("Authorization", "Bearer " + cleanToken));

        try {
            Pair<Integer, String> requestResult = Utilities.getRequestForString(url, headers);
            if (requestResult.first.equals(200)){
                JSONArray rows = new JSONArray(requestResult.second);
                return IntStream.range(0, rows.length()).parallel()
                        .mapToObj(index -> getJsonObjectByIndex(rows, index))
                        .map(o -> o != null ? parseRow(o, params[0]) : null)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
            }
        } catch (JSONException e) {
            Log.d("ERROR", e.toString());
        }

        return Collections.emptyList();
    }

    private JSONObject getJsonObjectByIndex(JSONArray rows, int index){
        try {
            JSONObject jsonObject = rows.getJSONObject(index);
            Log.i("JSON", jsonObject.toString());
            return jsonObject;
        } catch (JSONException e) {
            Log.d("JSON", e.toString());
            return null;
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private TableRow parseRow(JSONObject o, Context context){
        TableRow row = new TableRow(context);
        Arrays.stream(new String[]{"id", "site", "building", "level", "lights", "result", "set"})
                .map(o::optString)
                .map(v -> {
                    TextView tv = new TextView(context);
                    tv.setText(v);
                    tv.setGravity(Gravity.CENTER_HORIZONTAL);
                    return tv;
                }).forEach(row::addView);

        TextView timeView = new TextView(context);
        timeView.setText(extractTime(o.optString("created_at")));
        row.addView(timeView);

        return row;
    }

    private String extractTime(String t) {
        String[] s = t.split("T");

        String time = s[1].split("\\.")[0];
        String[] tmpDate = s[0].split("-");

        StringBuilder sb = new StringBuilder();
        for (int i = tmpDate.length - 1; i >= 1; i--) {
            sb.append(tmpDate[i]).append("-");
        }
        sb.append(tmpDate[0]);
        return sb.append(" ").append(time).toString();
    }
}
