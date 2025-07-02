provider "aws" {
  region = "us-west-2"
}
resource "aws_vpc" "demo_vpc" {
  cidr_block = "10.0.0.0/16"

}
resource "aws_subnet" "demo_subnet" {
  vpc_id            = aws_vpc.demo_vpc.id
  cidr_block        = "10.0.1.0/24"
}
resource "aws_internet_gateway" "igw" {

  vpc_id = aws_vpc.demo_vpc.id
}
resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.demo_vpc.id
  route {
      cidr_block = "0.0.0.0/0"
      gateway_id = aws_internet_gateway.igw.id
}
}
resource "aws_route_table_association" "rta" {
  subnet_id      = aws_subnet.demo_subnet.id
  route_table_id = aws_route_table.rt.id
}
resource "aws_security_group" "demo_sg" {
  vpc_id = aws_vpc.demo_vpc.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}