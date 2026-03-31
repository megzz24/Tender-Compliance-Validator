/*
Opens an EventSource to a given URL.
Collects log lines into an array as they arrive.
On connection error, falls back to polling getSession() every 5 seconds until status = done.
Returns { lines, done, error }.
*/