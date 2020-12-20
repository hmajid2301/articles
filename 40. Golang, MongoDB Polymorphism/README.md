---
title: "Golang & MongoDB with Polymorphism and BSON Unmarshal"
tags: ["golang", "mongodb", "polymorphism", "bson"]
license: "public-domain"
slug: "golang-mongodb-polymorphism"
canonical_url: "https://haseebmajid.dev/blog/golang-mongodb-polymorphism/"
date: "2020-12-20"
published: true
cover_image: "images/cover.png"
---

Recently I've been working on a new personal project called Banter Bus, a browser-based multiplayer game.
I've been working on a REST API to add new questions to the game. The API is built in Golang and uses
MongoDB as the database. Since Golang is a strongly typed language, we will need to specify the structure of
the data we expect from the database. This can get tricky if the data varies, such as one field changing.

One issue I encountered was each game type has to have its questions. These questions will be asked to the
users playing the game and are stored differently in the database. This is because each game type has different
rules and therefore needs a different structure. This means when we unmarshal the data in Golang,
we need to specify the structure of these questions. In this article, I will explain how you can create
your own unmarshal function. This will allow you to customise the struct that will hold this data (in Golang)
returned from MongoDB.

## Collection

Imagine the data stored in MongoDB looks something like so:

```json
[
  {
    "game_name": "fibbing_it",
    "questions": {
      "opinion": {
        "horse_group": {
          "questions": [
            "What do you think about horses?",
            "What do you think about camels?"
          ],
          "answers": ["lame", "tasty"]
        }
      },
      "free_form": {
        "bike_group": ["Favourite bike colour?", "A funny question?"]
      },
      "likely": ["to eat ice-cream from the tub", "to get arrested"]
    }
  },
  {
    "game_name": "quibly",
    "questions": {
      "pair": [
        "What do you think about horses?",
        "What do you think about camels?"
      ],
      "answers": ["Favourite bike colour?", "A funny question?"]
    }
  },
  {
    "game_name": "drawlosseum",
    "questions": { "drawings": ["horses", "camels"] }
  }
]
```

Here you can see each game type has a different structure, due to the different rules each game type
will have.

## Unmarshal

::: note BSON
Binary JSON the format used by MongoDB readme more about it [here](https://www.mongodb.com/json-and-bson)
:::

To do this we need to create a custom BSON unmarshal function. This will work very similarly to JSON unmarshaling.
When we try to get data from MongoDB, doing something like:

```golang
collection := _database.Collection("games")
err := collection.FindOne(_ctx, bson.M{"game_name": "quibly"}).Decode(interface{}{})
```

When decoding the object into a struct, MongoDB checks that the (struct) type implements the `Umarshaler` interface.
It implements this interface if it implements the `UnmarshalBSONValue(t bsontype.Type, data []byte) error` function.
If the struct type does implement this function, it will use this function instead of the default `UnmarshalBSONValue()`
function.

### Example

Let's take a look at an example, define the following struct.

```go
type QuestionSet struct {
	GameName  string      `bson:"game_name"`
	Questions interface{} `bson:"questions"`
}
```

Where the `Questions` field is the one that can vary between the different game types. Now let's define
the structure of the different game type. As you can see each of the game types will have different
rounds and ask different types of questions.

```go
type DrawlosseumQuestionsPool struct {
	Drawings []string `bson:"drawings,omitempty"`
}

type QuiblyQuestionsPool struct {
	Pair    []string `bson:"pair,omitempty"`
	Answers []string `bson:"answers,omitempty"`
	Group   []string `bson:"group,omitempty"`
}

type FibbingItQuestionsPool struct {
	Opinion  map[string]map[string][]string `bson:"opinion,omitempty"`
	FreeForm map[string][]string            `bson:"free_form,omitempty"`
	Likely   []string                       `bson:"likely,omitempty"`
}
```

To get the `QuestionSet` struct to implement the `Unmarshaler` interface we need to do something like:

```go
func (questionSet *QuestionSet) UnmarshalBSONValue(t bsontype.Type, data []byte) error {
	var rawData bson.Raw
	err := bson.Unmarshal(data, &rawData)
	if err != nil {
		return err
	}

	err = rawData.Unmarshal(&questionSet)
	if err != nil {
		return err
	}

	var questions struct {
		Questions bson.Raw
	}

	err = rawData.Unmarshal(&questions)
	if err != nil {
		return err
	}

	switch questionPool.GameName {
	case "drawlosseum":
		questionStructure := DrawlosseumQuestionsPool{}
		err = questions.Questions.Unmarshal(&questionStructure)
		questionPool.Questions = questionStructure
	case "quibly":
		questionStructure := QuiblyQuestionsPool{}
		err = questions.Questions.Unmarshal(&questionStructure)
		questionPool.Questions = questionStructure
	case "fibbing_it":
		questionStructure := FibbingItQuestionsPool{}
		err = questions.Questions.Unmarshal(&questionStructure)
		questionPool.Questions = questionStructure
	default:
		return errors.Errorf("Unknown game name %s", questionPool.GameName)
	}

	return err
}
```

This function looks very complicated so let's break it down and explain what's going on.

```go
	var rawData bson.Raw
	err := bson.Unmarshal(data, &rawData)
	if err != nil {
		return err
	}
```

First, we need to unmarshal the data into BSON raw data. We need the BSON raw data because it allows
us to partially unmarshal values. You can read more about it [here](https://godoc.org/gopkg.in/mgo.v2/bson#Raw).

```go
	err = rawData.Unmarshal(&questionSet)
	if err != nil {
		return err
	}
```

Next, we need to unmarshal the data into the `QuestionSet` struct, this is mainly to fill all the other fields (`GameName`)
besides `Questions`.

:::note Names
The struct tags we've defined `bson:"x"` should match the name of that field in the database, else the unmarshaling will not
work correctly i.e. the struct fields will be `nil`.
:::

```go
	var questions struct {
		Questions bson.Raw
	}

	err = rawData.Unmarshal(&questions)
	if err != nil {
		return err
	}
```

Now onto the part that deals with the `Questions` field. Here we get the raw BSON data only related to the `Questions` field. So it won't have anything
related to `GameName`. We create a "temporary" struct to hold this BSON data, with the same field name.

:::caution BSON Struct Tags
If your field has an `_` or something else a bit different, you should use the `bson` struct tags
to specify the name of the field in the database.
:::

```go
	switch questionPool.GameName {
	case "drawlosseum":
		questionStructure := DrawlosseumQuestionsPool{}
		err = questions.Questions.Unmarshal(&questionStructure)
		questionPool.Questions = questionStructure
	case "quibly":
		questionStructure := QuiblyQuestionsPool{}
		err = questions.Questions.Unmarshal(&questionStructure)
		questionPool.Questions = questionStructure
	case "fibbing_it":
		questionStructure := FibbingItQuestionsPool{}
		err = questions.Questions.Unmarshal(&questionStructure)
		questionPool.Questions = questionStructure
	default:
		return errors.Errorf("Unknown game name %s", questionPool.GameName)
	}
```

Finally, let's take a look at the code that unmarshal our questions into the correct structs.
We will use a switch type statement. In this example, the `GameName` will determine how the questions
are stored. Each case looks something like:

```go
	questionStructure := DrawlosseumQuestionsPool{}
	err = questions.Questions.Unmarshal(&questionStructure)
	questionPool.Questions = questionStructure
```

We define the correct struct to use. Then we unmarshal the raw BSON data into this struct. We then assign this struct
to the `questionPool` variable. This is what will be "returned" when we use `FindOne` function shown above.

That's it! We've now created our custom unmarshal function for dealing with polymorphic data stored in MongoDB in
Golang.

## Appendix

- [Cover Photo](https://github.com/mongodb/mongo-go-driver/)
- [Example Project](https://gitlab.com/banter-bus/banter-bus-server/-/blob/39c05ef7e3097697e25343b47f4846d11f9e7ae5/src/core/models/user_models.go#L86-125)
