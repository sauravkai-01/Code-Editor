#include<iostream>
using namespace std;
int main(){
    char arr[10]={'A','B','C','D','E','F'};
    int max_ub=sizeof(arr)/sizeof(arr[0]);
    int ub=5,index=2,i,j;
    for(int i=index;i<=ub;i++)
    {
        j=i+1;
        arr[i]=arr[j];
    }
    for(int i=0;i<max_ub;i++)
    {
        cout<<arr[i]<<" ";
    }
    
}