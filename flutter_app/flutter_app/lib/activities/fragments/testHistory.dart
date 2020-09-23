import 'dart:async';
import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_app/classes/singletons/loggedUser.dart';
import 'package:http/http.dart' as http;
import 'package:pmap/pmap.dart';

class TestHistory extends StatefulWidget {

  @override
  State<TestHistory> createState() => TestHistoryState();

}

class TestHistoryState extends State<TestHistory> {
  static const String TRIAL_TESTS_URL = "http://63.32.97.125:5000/api/trialtests/usr/";

  Timer _timer;
  Future<List<DataRow>> tableFuture;
  TextStyle tableHeaderStyle;

  @override
  void initState() {
    refresh();
    _timer = new Timer.periodic(
        Duration(seconds: 300), (_) => setState(() => refresh()));
    super.initState();
  }

  void refresh() {
    LoggedUser user = LoggedUser.getInstance(null);
    tableFuture = getTestsTable(user.id, user.token);
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    TextStyle style = TextStyle(fontFamily: 'Montserrat', fontSize: 20.0);
    TextStyle titleStyle = TextStyle(fontFamily: 'Montserrat', fontSize: 24.0);
    TextStyle smallText = TextStyle(fontFamily: 'Montserrat', fontSize: 14.0);

    final title = Text(
      'Test History',
      textAlign: TextAlign.center,
      style: titleStyle,
    );

    final testsTable = new FutureBuilder(
        future: tableFuture,
        builder: (BuildContext context, AsyncSnapshot<List<DataRow>> snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.none:
              return new Text('No connection');
              break;
            case ConnectionState.waiting:
              return new Text('Awaiting result...');
              break;
            default:
              if (snapshot.hasError)
                return new Text('${snapshot.error}');
              else
                return new InteractiveViewer(constrained: false,
                        child: DataTable(sortColumnIndex: 0, sortAscending: false,
                            columns: [
                          DataColumn(
                              label: Text('ID', style: tableHeaderStyle)),
                          DataColumn(
                              label: Text('Site', style: tableHeaderStyle)),
                          DataColumn(
                              label: Text('Building', style: tableHeaderStyle)),
                          DataColumn(
                              label: Text('Levels', style: tableHeaderStyle)),
                          DataColumn(
                              label: Text('Devices', style: tableHeaderStyle)),
                          DataColumn(
                              label: Text('Status', style: tableHeaderStyle)),
                          DataColumn(
                              label: Text('Set', style: tableHeaderStyle)),
                          DataColumn(label: Text(
                              'Start time', style: tableHeaderStyle))
                        ], rows: snapshot.data)
                    );
          }
        }
    );

    return new Scaffold(
        body: Container(
          child: Column(
            children: [
              title,
              testsTable
            ],
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
          ),
        )
    );
  }

  Stream<List<DataRow>> getTestsTable(int id, String token) {
    String url = TRIAL_TESTS_URL + id.toString();
    Future<http.Response> response = http.get(
        url, headers: {"Authorization": "Bearer $token"})
        .then((response) => {
          if (response.statusCode == 200){

    });
  }

  if (response.statusCode == 200) {
  return pmap(response.body, parseRows)
  }throw new Exception("Error ${response.statusCode}"
  );
}

  List<DataRow> parseRows(String body) {
    List<dynamic> t1 = jsonDecode(body);
    List<DataRow> t2 = t1.map((e) => jsonToRow(e)).toList();
    return t2;
  }

  DataRow jsonToRow(Map<String,dynamic> item) =>
      DataRow(cells: [
        DataCell(Text(item['id'].toString())),
        DataCell(Text(item['site'].toString())),
        DataCell(Text(item['building'].toString())),
        DataCell(Text(item['level'].toString())),
        DataCell(Text(item['lights'].toString())),
        DataCell(Text(item['result'].toString())),
        DataCell(Text(item['set'].toString())),
        DataCell(Text(extractTime(item['created_at'])))
      ]);

    String extractTime(t) {
      final s = t.split("T");
      String date = s[0]
          .split("-")
          .reversed
          .join(".");
      String time = s[1].split(".")[0];
      return '$date $time';
    }
}