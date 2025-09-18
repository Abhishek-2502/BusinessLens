pipeline {
    agent { label 'businesslens' }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Pre-Build Cleanup') {
            steps {
                echo 'Pruning unused Docker resources before build...'
                sh '''
                    docker-compose down --remove-orphans --volumes || true
                    docker container rm -f businesslens-frontend-1 || true
                    docker container rm -f businesslens-backend-1 || true
                    docker system prune -f --volumes || true
                '''
            }
        }

        stage('Build and Deploy') {
            steps {
                echo 'Building and starting Docker containers...'
                sh '''
                    docker-compose build --no-cache
                    docker-compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo 'Build and deployment succeeded!'
        }
        failure {
            echo 'Build or deployment failed.'
        }
        always {
            echo 'Build and deployment process finished.'
            sh 'docker-compose ps'
        }
    }
}