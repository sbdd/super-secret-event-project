namespace CommandService.Commands

open System
open FSharp.Data

type NewProspectJ = JsonProvider<"../../contracts/newprospect.json">

type Command =
 | NewProspect of NewProspectJ.Root

module Handler =
    let dispatch cmd =
        match cmd with
         | NewProspect(p) -> printfn "new prospect %i %s" p.Id p.Name
