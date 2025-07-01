# factorial number print
#!/bin/bash
echo "enter a number:"
read num
fact 1
for (( i=1 ; 1<= num; i++))
do
fact=$((fact*i))
done
echo "factorial of $num is $fact"