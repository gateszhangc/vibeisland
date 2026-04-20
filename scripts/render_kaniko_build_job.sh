#!/usr/bin/env bash
set -euo pipefail

BUILD_JOB_NAMESPACE="${BUILD_JOB_NAMESPACE:-dokploy-fleet-build}"
BUILD_JOB_NAME="${BUILD_JOB_NAME:?BUILD_JOB_NAME is required}"
BUILD_CONTEXT="${BUILD_CONTEXT:?BUILD_CONTEXT is required}"
BUILD_IMAGE="${BUILD_IMAGE:?BUILD_IMAGE is required}"
BUILD_DOCKERFILE="${BUILD_DOCKERFILE:-Dockerfile}"
BUILD_JOB_SECRET="${BUILD_JOB_SECRET:-fleet-registry-push}"
KANIKO_IMAGE="${KANIKO_IMAGE:-gcr.io/kaniko-project/executor:v1.23.2-debug}"

cat <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: ${BUILD_JOB_NAME}
  namespace: ${BUILD_JOB_NAMESPACE}
spec:
  backoffLimit: 0
  ttlSecondsAfterFinished: 1800
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: kaniko
          image: ${KANIKO_IMAGE}
          args:
            - --context=${BUILD_CONTEXT}
            - --dockerfile=${BUILD_DOCKERFILE}
            - --destination=${BUILD_IMAGE}
            - --cache=false
          volumeMounts:
            - name: docker-config
              mountPath: /kaniko/.docker
      volumes:
        - name: docker-config
          secret:
            secretName: ${BUILD_JOB_SECRET}
            items:
              - key: .dockerconfigjson
                path: config.json
EOF
