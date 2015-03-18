namespace CommandService.Api

open System
open System.IO
open Nancy
open Nancy.Hosting.Self
open CommandService.Commands
open CommandService.Commands.Handler

module Modules =
    type NancyModule with
        member this.AsJson () =
            let stream = this.Request.Body
            let reader = new StreamReader(stream)
            let content: string = reader.ReadToEnd()
            stream.Position <- 0L
            content

        member this.Dispatch status cmd =
            dispatch cmd
            status :> obj

        member this.Ok = this.Dispatch 200
        member this.Create = this.Dispatch 201
        member this.NoContent = this.Dispatch 204


module Host = 
    let listenAt host port =
        let host = new NancyHost(new Uri(sprintf "http://%s:%i" host port))
        ((fun () -> host.Start()), (fun () -> host.Stop()))