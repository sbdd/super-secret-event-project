module CommandService.Main

open System
open Api.Host

[<EntryPoint>]
let main args = 
    let start,stop = listenAt "localhost" 3000
    start()
    printfn "listing at http://localhost:3000..."
    printfn "press any ke to exit"
    Console.ReadLine() |> ignore
    stop()
    0
