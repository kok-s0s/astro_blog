---
title: 'Design Ideas Behind Message Queues'
---

Message queues are a common engineering solution for asynchronous communication, system decoupling, and traffic buffering. The core idea is to put a durable buffer between producers and consumers so each side can evolve and scale independently.

# Suitable Scenarios

- **Asynchronous processing**: producers submit tasks and continue without waiting for consumers to finish.
- **System decoupling**: services communicate through messages instead of direct calls, reducing dependency pressure.
- **Traffic peak shaving**: sudden bursts are stored first, then processed at a pace downstream systems can handle.

# Common Products

- **ActiveMQ**: an open-source Java message broker.
- **RabbitMQ**: an AMQP-based broker written in Erlang.
- **Kafka**: a distributed log system designed for high-throughput streaming.
- **RocketMQ**: a distributed messaging platform with strong consistency and high performance.
- **Pulsar**: a cloud-native streaming platform with multi-tenancy and cross-region replication.

# Core Design

A message queue normally has three parts:

- **Producer**: creates messages and decides which queue or partition receives them.
- **Queue cluster**: stores, filters, and dispatches messages. Storage design usually determines throughput and reliability.
- **Consumer**: reads messages and processes them, commonly through push or pull models.

# Data Organization

Different products use different storage models. Kafka uses an append-only log for high throughput. RocketMQ and Pulsar focus more on consistency, availability, and distributed storage control.

# Consumer Model

Consumer models affect ordering and delivery guarantees. Kafka keeps ordering inside a partition, while other systems may support different subscription and consumer-group models.

# Summary

Message queues are not just middleware. They encode several practical design ideas: buffering, decoupling, durability, ordering, retry, and backpressure.
