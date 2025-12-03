pipeline {
  agent any

  environment {
    AWS_REGION = 'us-east-1'
    ECR_BACKEND = '996417348492.dkr.ecr.us-east-1.amazonaws.com/backend'
    ECR_FRONTEND = '996417348492.dkr.ecr.us-east-1.amazonaws.com/frontend'
    SONAR_TOKEN = credentials('sonarqube-token')
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          sh '''
            /opt/sonar-scanner/bin/sonar-scanner \
              -Dsonar.projectKey=nti-app \
              -Dsonar.sources=. \
              -Dsonar.host.url=http://3.83.64.206:9000 \
              -Dsonar.login=$SONAR_TOKEN
          '''
        }
      }
    }

    stage('Wait for Quality Gate') {
      steps {
        timeout(time: 3, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Build & Scan Backend Image') {
      steps {
        dir('backend') {
          script {
            def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
            env.BACKEND_TAG = commit
            def image = "${env.ECR_BACKEND}:${commit}"

            sh """
              docker build -t ${image} .
              trivy image --exit-code 1 --severity HIGH,CRITICAL ${image}
              aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin 996417348492.dkr.ecr.us-east-1.amazonaws.com
              docker push ${image}
            """
          }
        }
      }
    }

    stage('Build & Scan Frontend Image') {
      steps {
        dir('frontend') {
          script {
            def image = "${env.ECR_FRONTEND}:${env.BACKEND_TAG}"
            env.FRONTEND_TAG = env.BACKEND_TAG // same as backend for consistency

            sh """
              docker build -t ${image} .
              trivy image --exit-code 1 --severity HIGH,CRITICAL ${image}
              aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin 996417348492.dkr.ecr.us-east-1.amazonaws.com
              docker push ${image}
            """
          }
        }
      }
    }

    stage('Update Deployment YAMLs') {
      steps {
        script {
          sh """
            sed -i 's|image:.*backend.*|image: ${env.ECR_BACKEND}:${env.BACKEND_TAG}|' k8s/backend-deployment.yaml
            sed -i 's|image:.*frontend.*|image: ${env.ECR_FRONTEND}:${env.FRONTEND_TAG}|' k8s/frontend-deployment.yaml
          """
        }
      }
    }

    stage('Deploy to EKS') {
      steps {
        script {
          sh """
            kubectl apply -f k8s/backend-deployment.yaml
            kubectl apply -f k8s/backend-service.yaml
            kubectl apply -f k8s/frontend-deployment.yaml
            kubectl apply -f k8s/frontend-service.yaml
            kubectl apply -f k8s/ingress.yaml
          """
        }
      }
    }
  }

   post {
    always {
      slackSend (
        channel: '#test', 
        color: '#439FE0', 
        message: "📣 Job `${env.JOB_NAME}` started: Build #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
      )
    }
    success {
      slackSend (
        channel: '#test', 
        color: 'good', 
        message: "✅ Job `${env.JOB_NAME}` succeeded: Build #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
      )
    }
    failure {
      slackSend (
        channel: '#test', 
        color: 'danger', 
        message: "❌ Job `${env.JOB_NAME}` failed: Build #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
      )
    }
  }
  
}
