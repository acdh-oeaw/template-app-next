{{- define "app.selectorLabels" -}}
app.kubernetes.io/name: frontend
app.kubernetes.io/instance: {{ .Values.name }}
{{- end }}

{{/* `deploy.sh` finds the resources of a deployment by `instance` and `managed-by`. `ID` is the redmine service id. */}}
{{- define "app.labels" -}}
{{ include "app.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Values.managedBy }}
ID: {{ .Values.serviceId | quote }}
{{- end }}

{{- define "app.host" -}}
{{ (urlParse .Values.baseUrl).host }}
{{- end }}

{{/* changes with the values, so that changed values restart the pods, and a rollback restores the previous ones. */}}
{{- define "app.envSecretName" -}}
{{ .Values.name }}-env-{{ .Values.env | toJson | sha256sum | trunc 10 }}
{{- end }}
