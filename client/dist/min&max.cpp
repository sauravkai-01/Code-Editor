#include<iostream>
using namespace std;
int main(){
    int arr[10]={10,15,2,5,-1,99,200,-55,20,32};
    int min=INT16_MAX,sec_min=INT16_MAX;
    for(int i=0;i<(sizeof(arr)/sizeof(arr[0]));i++)
    {
        if(arr[i]<min)
        {
            min=arr[i];
        }
    }
    cout<<min<<endl;
    for(int i=0;i<(sizeof(arr)/sizeof(arr[0]));i++)
    {
        if(arr[i]<sec_min)
        {
            if(arr[i]==min)
            {
                continue;
            }
            sec_min=arr[i];
        }
    }
    cout<<sec_min;
}