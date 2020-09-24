package com.example.egg_em.operations;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Build;
import android.util.Log;
import android.util.Pair;
import android.view.Gravity;
import android.view.View;
import android.widget.TableRow;
import android.widget.TextView;

import androidx.annotation.RequiresApi;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.example.egg_em.R;
import com.example.egg_em.classes.Utilities;
import com.example.egg_em.classes.listeners.TestRowListener;
import com.example.egg_em.classes.singletons.LoggedUser;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;


public class GenerateTableOperation extends AsyncTask<Context, Integer, List<TableRow>> {

    private static String URL = "http://63.32.97.125:5000/api/trialtests/usr/%d/%d";
    private View fragment;

    public GenerateTableOperation(View fragment) {
        Log.d("CHECK NULL", "TABLE_OPERATION_CONSTRUCTOR: " + (fragment == null));
        this.fragment = fragment;
    }

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

        Pair<Integer, JSONArray> result = Utilities.getRequestForJsonArray(url, user.createAuthHeader());
        if (result.first.equals(200)){
            Log.d("CHECK", "1");
            JSONArray rows = result.second;
            return IntStream.range(0, rows.length()).parallel()
                    .mapToObj(index -> Utilities.getJsonObjectByIndex(rows, index))
                    .map(o -> o != null ? parseRow(o, params[0]) : null)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private TableRow parseRow(JSONObject o, Context context){
        TableRow row = (TableRow) View.inflate(context, R.layout.clickable_table_row, null);

        Log.d("CHECK", "2");

        Arrays.stream(new String[]{"id", "site", "building", "level", "lights", "result", "set"})
                .map(o::optString)
                .map(v -> {
                    TextView tv = (TextView) View.inflate(context, R.layout.cell, null);
                    Log.d("CHECK", "3" + (tv == null));
                    tv.setText(v);
                    return tv;
                }).forEach(row::addView);

        TextView timeView = (TextView) View.inflate(context, R.layout.cell, null);
        timeView.setText(extractTime(o.optString("created_at")));
        row.addView(timeView);

        // add row onclicklistener to open popup
        row.setOnClickListener(new TestRowListener(o.optInt("id"), fragment));

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
