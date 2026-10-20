// Teaching sketch: MIT; platform implementation remains under its own license.
export const SERIAL_ECHO="void setup() {\n  Serial.begin(115200);\n  Serial.setTimeout(100);\n}\n\nvoid loop() {\n  if (Serial.available()) {\n    String message = Serial.readStringUntil('\\n');\n    Serial.println(message);\n  }\n}\n";
