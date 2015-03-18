namespace CommandService.Api

open System
open Nancy
open CommandService.Api.Modules
open CommandService.Commands

type CommandModule() as self = 
    inherit NancyModule()
    do
        self.Post.["/prospect/new"] <- fun _ -> self.Create(NewProspect(self.AsJson() |> NewProspectJ.Parse))

