Overview Architecture
GitHub Repo ──▶ Jenkins CI ──▶ DockerHub
                           └──▶ EKS Cluster (via Terraform)
                                       └─▶ MongoDB, NodeJs-App
                                                 └─▶ Access via Ingress + TLS (Let's Encrypt)

STEP 1: Provision EC2 Ubuntu Server
OS: Ubuntu 22.04 LTS
Security Group Inbound Rules:
SSH: 22
Jenkins: 8080
SonarQube: 9000
HTTP/HTTPS: 80/443
Port: 5050 application

Install Required Packages
Run the following script to install required tools:
chmod +x tools-install.sh
./tools-install.sh
This installs:

Jenkins
Terraform
Docker
AWS CLI
Java (OpenJDK 17)
kubectl

STEP 2: Create EKS Cluster with Terraform
Clone EKS Terraform Code:
git clone https://github.com/deepsaha288/delat-capita-Assignment.git
cd eks-terraform
Apply via Jenkins Pipeline:
set up: Jenkinsfile-eks-terraform --> here

Terraform uses remote backend (S3 + DynamoDB).

STEP 3: Connect kubectl to EKS
aws eks --region us-east-1 update-kubeconfig --name Client-EKS-Cluster
kubectl get nodes

STEP 4: Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

STEP 5: Install cert-manager for TLS
kubectl apply --validate=false -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
kubectl apply -f clients-api/cluster-issuer.yaml

STEP 6: Configure DNS
Get ELB hostname:
kubectl get svc ingress-nginx-controller -n ingress-nginx

I Update my domain DNS (via Route53):
clients.api.deltacapita.com → a1b2c3d4e5f6g7h8.elb.amazonaws.com

STEP 7: Deploy Clients API + MongoDB to EKS
Create Namespace:
kubectl create namespace mern-app
Apply All Manifests:
kubectl apply -f manifest-file/namespace.yaml
kubectl apply -f manifest-file/mongodb-deployment.yaml
kubectl apply -f manifest-file/mongodb-service.yaml
kubectl apply -f manifest-file/mongo-express-deployment.yaml
kubectl apply -f manifest-file/mongo-express-service.yaml
kubectl apply -f manifest-file/app-deployment.yaml
kubectl apply -f manifest-file/app-service.yaml
kubectl apply -f manifest-file/issuer.yaml
kubectl apply -f manifest-file/certificate.yaml
kubectl apply -f manifest-file/ingress.yaml

STEP 8: Jenkins CI/CD Pipeline Setup
The Jenkinsfile has the following stages:
Checkout – Pull code from GitHub
Build Docker Image – Docker build images
Push Image to DockerHub- images push into dockerhub registry
Deploy to EKS – Run kubectl apply on all manifests

Credentials i setup on Jenkins console:
github-creds – GitHub PAT
dockerhub-creds – DockerHub login
aws-creds – AWS IAM credentials with EKS access

Validate the Deployment:
Access the App:
https://clients.api.deltacapita.com
Check TLS:
HTTPS enabled with Let's Encrypt
Valid certificate issued

Check Kubernetes Health:
kubectl get all -n clients-api-ns
kubectl describe ingress -n clients-api-ns



Clients API Full Architecture Diagram

                      ┌────────────────────────────────────────┐
                      │        Developer / CI/CD User          │
                      └────────────────────────────────────────┘
                                       │  Git Push / Webhook
                                       ▼
                          ┌────────────────────────────┐
                          │      Jenkins on EC2        │
                          │  + Docker, Kubectl, etc. │
                          └────────────────────────────┘
                                       │
                                       ▼
                          ┌────────────────────────────┐
                          │     Docker Build & Push     │
                          │     to DockerHub (Private)  │
                          └────────────────────────────┘
                                       │
                                       ▼
                          ┌────────────────────────────┐
                          │     Terraform on Jenkins    │
                          │ Creates EKS Cluster + VPC   │
                          └────────────────────────────┘
                                       │
                                       ▼
            ┌────────────────────────────────────────────────────────┐
            │                    AWS EKS CLUSTER                     │
            │ ┌────────────────────────┐  ┌────────────────────────┐ │
            │ │     NGINX Ingress      │  │     cert-manager       │ │
            │ │   (type: LoadBalancer) │  │   (LetsEncrypt Certs)  │ │
            │ └─────────▲──────┬───────┘  └────────────────────────┘ │
            │           │      │TLS (443)                            │
            │           │      ▼                                     │
            │ ┌────────────────────────────┐                         │
            │ │  Ingress Route:            │                         │
            │ │  clients.api.deltacapita…  │                         │  
            │ └────────────┬───────────────┘                         │
            │              ▼                                         │
            │ ┌────────────────────────────┐     ┌────────────────┐  │
            │ │       Clients API          │ <-->│    MongoDB     │  │
            │ │ (Node.js app deployment)   │     │ (Deployment)   │  │
            │ └────────────────────────────┘     └────────────────┘  │
            └────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                        ┌─────────────────────────────────┐
                        │   Route53 or External DNS       │
                        │ CNAME → ELB from Ingress        │
                        └─────────────────────────────────┘

